from typing import List, Dict
from app.core.config import supabase
from app.schemas.finance import BudgetSummary

def get_monthly_data(user_id: str, month: str):
    start_date = f"{month}-01"
    income_response = supabase.table("income").select("*").eq("user_id", user_id).gte("date", start_date).lte("date", f"{month}-31").execute()
    incomes = income_response.data
    expense_response = supabase.table("expenses").select("*").eq("user_id", user_id).gte("date", start_date).lte("date", f"{month}-31").execute()
    expenses = expense_response.data
    budget_response = supabase.table("budgets").select("*").eq("user_id", user_id).eq("month", month).execute()
    budget_data = budget_response.data[0] if budget_response.data else None
    
    return incomes, expenses, budget_data

def calculate_summary(user_id: str, month: str) -> BudgetSummary:
    if not supabase:
        return BudgetSummary(total_income=0, total_expenses=0, remaining_budget=0, savings_recommendation=0, status="Database not connected", category_breakdown={}, emergency_fund_recommendation=0, alerts=[], insights="", overspending_categories=[])

    incomes, expenses, budget_data = get_monthly_data(user_id, month)
    
    total_income = sum(item['amount'] for item in incomes)
    total_expenses = sum(item['amount'] for item in expenses)
    
    budget_amount = budget_data['total_budget'] if budget_data else 0
    
    remaining = budget_amount - total_expenses
    
    savings_rec = total_income * 0.20
    
    status = "On Track"
    if total_expenses > budget_amount and budget_amount > 0:
        status = "Over Budget"
    elif total_expenses < budget_amount:
        status = "Under Budget"
        
    breakdown = {}
    for exp in expenses:
        cat = exp['category']
        breakdown[cat] = breakdown.get(cat, 0) + exp['amount']
    alerts = []
    if total_expenses > total_income and total_income > 0:
        alerts.append("Expenses exceed income")
    if budget_amount and total_expenses > budget_amount:
        alerts.append("Expenses exceed budget")
    emergency_fund = total_expenses * 3
    top_cats = sorted(breakdown.items(), key=lambda x: x[1], reverse=True)
    overspending = [c for c, _ in top_cats[:3]]
    insights_text = ""
    if overspending:
        insights_text = f"Top spending categories: {', '.join(overspending)}"
    return BudgetSummary(total_income=total_income, total_expenses=total_expenses, remaining_budget=remaining, savings_recommendation=savings_rec, status=status, category_breakdown=breakdown, emergency_fund_recommendation=emergency_fund, alerts=alerts, insights=insights_text, overspending_categories=overspending)
