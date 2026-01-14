from pydantic import BaseModel, Field
from typing import Optional, List
import datetime
from uuid import UUID

# Income Schemas
class IncomeBase(BaseModel):
    amount: float
    source: str
    entry_date: datetime.date = Field(default_factory=datetime.date.today)

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
    entry_date: datetime.date = Field(default_factory=datetime.date.today)

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
    emergency_fund_recommendation: float | None = 0
    alerts: list[str] | None = []
    insights: str | None = ""
    overspending_categories: list[str] | None = []

class BudgetPlanRequest(BaseModel):
    month: str

class BudgetPlanResponse(BaseModel):
    month: str
    needs: float
    wants: float
    savings: float
    total_budget: float
    explanation: str
