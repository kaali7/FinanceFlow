from pydantic import BaseModel

class ProfileData(BaseModel):
    monthly_income: float | None = 0
    savings_rate: float | None = 0.2
