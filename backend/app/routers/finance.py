from fastapi import APIRouter, HTTPException, Depends
from app.schemas.finance import IncomeCreate, IncomeResponse, ExpenseCreate, ExpenseResponse, BudgetCreate, BudgetResponse, BudgetSummary
from app.core.config import supabase
from app.services import finance_service
from typing import List

router = APIRouter(prefix="/finance", tags=["Finance"])

# Helper to check DB
def check_db():
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")

@router.post("/income", response_model=IncomeResponse)
def add_income(income: IncomeCreate):
    check_db()
    data = income.model_dump()
    # Convert date to string for supabase if needed, but pydantic handles it mostly.
    data['date'] = str(data['date'])
    # Hardcoded user_id for demo purposes (Phase 2 says "Basic or Supabase Auth")
    # In a real app, extract user_id from JWT token
    data['user_id'] = "00000000-0000-0000-0000-000000000000" 
    
    response = supabase.table("income").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to add income")
    return response.data[0]

@router.post("/expenses", response_model=ExpenseResponse)
def add_expense(expense: ExpenseCreate):
    check_db()
    data = expense.model_dump()
    data['date'] = str(data['date'])
    data['user_id'] = "00000000-0000-0000-0000-000000000000"
    
    response = supabase.table("expenses").insert(data).execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to add expense")
    return response.data[0]

@router.post("/budget", response_model=BudgetResponse)
def set_budget(budget: BudgetCreate):
    check_db()
    data = budget.model_dump()
    data['user_id'] = "00000000-0000-0000-0000-000000000000"
    
    # Upsert logic usually preferred for budgets
    response = supabase.table("budgets").upsert(data, on_conflict="user_id, month").execute()
    if not response.data:
        raise HTTPException(status_code=400, detail="Failed to set budget")
    return response.data[0]

@router.get("/summary/{month}", response_model=BudgetSummary)
def get_summary(month: str):
    # user_id hardcoded
    return finance_service.calculate_summary("00000000-0000-0000-0000-000000000000", month)
