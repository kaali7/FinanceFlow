from fastapi import APIRouter, HTTPException, Header
from app.schemas.finance import IncomeCreate, IncomeResponse, ExpenseCreate, ExpenseResponse, BudgetCreate, BudgetResponse, BudgetSummary, BudgetPlanRequest, BudgetPlanResponse
from app.core.config import supabase
from app.services import finance_service
from app.services.auth_service import get_user_by_token
from app.services.ai_service import get_ai_response
from typing import List

router = APIRouter(prefix="/finance", tags=["Finance"])

# Helper to check DB
def check_db():
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

@router.post("/income", response_model=IncomeResponse)
def add_income(income: IncomeCreate, authorization: str | None = Header(default=None)):
    check_db()
    data = income.model_dump()
    data['date'] = str(data.pop('entry_date'))
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    data['user_id'] = user_id 
    
    response = supabase.table("income").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to add income")
    return response.data[0]

@router.post("/expenses", response_model=ExpenseResponse)
def add_expense(expense: ExpenseCreate, authorization: str | None = Header(default=None)):
    check_db()
    data = expense.model_dump()
    data['date'] = str(data.pop('entry_date'))
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    data['user_id'] = user_id
    desc = (data.get('description') or '').lower()
    cat = data.get('category') or 'Other'
    mapping = [
        ('Food', ['food', 'restaurant', 'grocer', 'meal', 'coffee']),
        ('Transport', ['uber', 'bus', 'train', 'taxi', 'cab', 'fuel']),
        ('Utilities', ['electric', 'water', 'internet', 'utility', 'wifi']),
        ('Entertainment', ['movie', 'netflix', 'game', 'concert']),
        ('Housing', ['rent', 'mortgage'])
    ]
    if cat == 'Other' and desc:
        for mcat, kws in mapping:
            if any(k in desc for k in kws):
                data['category'] = mcat
                break
    
    response = supabase.table("expenses").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to add expense")
    return response.data[0]

@router.post("/budget", response_model=BudgetResponse)
def set_budget(budget: BudgetCreate, authorization: str | None = Header(default=None)):
    check_db()
    data = budget.model_dump()
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    data['user_id'] = user_id
    
    response = supabase.table("budgets").upsert(data, on_conflict="user_id, month").execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to set budget")
    return response.data[0]

@router.get("/summary/{month}", response_model=BudgetSummary)
def get_summary(month: str, authorization: str | None = Header(default=None)):
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    return finance_service.calculate_summary(user_id, month)

@router.post("/auto_budget", response_model=BudgetResponse)
def auto_budget(budget: BudgetCreate, authorization: str | None = Header(default=None)):
    check_db()
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    prof = supabase.table("profiles").select("*").eq("user_id", user_id).execute().data
    monthly_income = 0
    savings_rate = 0.2
    if prof:
        monthly_income = float(prof[0].get("monthly_income") or 0)
        savings_rate = float(prof[0].get("savings_rate") or 0.2)
    if monthly_income == 0:
        incomes, _, _ = finance_service.get_monthly_data(user_id, budget.month)
        monthly_income = sum(item['amount'] for item in incomes)
    alloc = monthly_income * (1 - savings_rate)
    payload = {"user_id": user_id, "month": budget.month, "total_budget": alloc}
    resp = supabase.table("budgets").upsert(payload, on_conflict="user_id, month").execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Failed to set auto budget")
    return resp.data[0]

@router.get("/history")
def history(months: int = 6, authorization: str | None = Header(default=None)):
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    out = []
    resp = supabase.table("budgets").select("*").eq("user_id", user_id).order("month", desc=False).limit(months).execute().data
    for b in resp:
        m = b["month"]
        incomes, expenses, _ = finance_service.get_monthly_data(user_id, m)
        out.append({
            "month": m,
            "income": sum(i["amount"] for i in incomes),
            "expenses": sum(e["amount"] for e in expenses),
            "budget": float(b.get("total_budget") or 0)
        })
    return out

@router.post("/budget_plan", response_model=BudgetPlanResponse)
def budget_plan(req: BudgetPlanRequest, authorization: str | None = Header(default=None)):
    check_db()
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    prof = supabase.table("profiles").select("*").eq("user_id", user_id).execute().data
    monthly_income = 0.0
    if prof:
        monthly_income = float(prof[0].get("monthly_income") or 0)
    if monthly_income == 0:
        incomes, _, _ = finance_service.get_monthly_data(user_id, req.month)
        monthly_income = sum(item["amount"] for item in incomes)
    needs = monthly_income * 0.5
    wants = monthly_income * 0.3
    savings = monthly_income * 0.2
    total_budget = needs + wants
    supabase.table("budgets").upsert({"user_id": user_id, "month": req.month, "total_budget": total_budget}, on_conflict="user_id, month").execute()
    ctx = f"Month: {req.month}. Income: {monthly_income:.2f}. Needs: {needs:.2f}. Wants: {wants:.2f}. Savings: {savings:.2f}."
    text = get_ai_response("Explain this 50/30/20 budget plan to the user in simple terms.", context=ctx)
    if not isinstance(text, str):
        text = "Generated a 50/30/20 plan allocating 50% to needs, 30% to wants, and 20% to savings."
    return BudgetPlanResponse(month=req.month, needs=needs, wants=wants, savings=savings, total_budget=total_budget, explanation=text)

@router.delete("/expenses/{id}")
def delete_expense(id: str, authorization: str | None = Header(default=None)):
    check_db()
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    response = supabase.table("expenses").delete().eq("id", id).eq("user_id", user_id).execute()
    return {"message": "Expense deleted"}

@router.put("/expenses/{id}", response_model=ExpenseResponse)
def update_expense(id: str, expense: ExpenseCreate, authorization: str | None = Header(default=None)):
    check_db()
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    data = expense.model_dump()
    data['date'] = str(data.pop('entry_date'))
    response = supabase.table("expenses").update(data).eq("id", id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Expense not found")
    return response.data[0]

@router.delete("/income/{id}")
def delete_income(id: str, authorization: str | None = Header(default=None)):
    check_db()
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    response = supabase.table("income").delete().eq("id", id).eq("user_id", user_id).execute()
    return {"message": "Income deleted"}

@router.put("/income/{id}", response_model=IncomeResponse)
def update_income(id: str, income: IncomeCreate, authorization: str | None = Header(default=None)):
    check_db()
    user_id = get_user_by_token(authorization) if authorization else None
    if not user_id:
        raise HTTPException(status_code=401, detail="Login required")
    data = income.model_dump()
    data['date'] = str(data.pop('entry_date'))
    response = supabase.table("income").update(data).eq("id", id).eq("user_id", user_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Income not found")
    return response.data[0]
