from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from uuid import UUID

# Income Schemas
class IncomeBase(BaseModel):
    amount: float
    source: str
    date: date = date.today()

class IncomeCreate(IncomeBase):
    pass

class IncomeResponse(IncomeBase):
    id: UUID
    user_id: UUID
    created_at: str

# Expense Schemas
class ExpenseBase(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: date = date.today()

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: UUID
    user_id: UUID
    created_at: str

# Budget Schemas
class BudgetBase(BaseModel):
    month: str # YYYY-MM
    total_budget: float

class BudgetCreate(BudgetBase):
    pass

class BudgetResponse(BudgetBase):
    id: UUID
    user_id: UUID
    created_at: str

class BudgetSummary(BaseModel):
    total_income: float
    total_expenses: float
    remaining_budget: float
    savings_recommendation: float
    status: str # "Under Budget", "Over Budget", "On Track"
    category_breakdown: dict
