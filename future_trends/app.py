import hmac
import os

import joblib
import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title="Restaurant AI Analytics")

# Load models
revenue_model = joblib.load(os.path.join(BASE_DIR, "revenue_model.pkl"))
profit_model = joblib.load(os.path.join(BASE_DIR, "profit_model.pkl"))

FEATURES = [
    "week_revenue",
    "week_orders",
    "avg_order_value",
    "total_expense",
    "profit",
    "off_days",
]

# When set, every /predict call must present the same value in X-AI-Token.
# The backend sends it; browsers never call this service directly.
AI_SERVICE_TOKEN = os.environ.get("AI_SERVICE_TOKEN", "")


class WeeklyFeatures(BaseModel):
    """Bounds keep a malformed or hostile payload away from the models."""

    week_revenue: float = Field(ge=0, le=1_000_000_000)
    week_orders: int = Field(ge=0, le=1_000_000)
    avg_order_value: float = Field(ge=0, le=10_000_000)
    total_expense: float = Field(ge=0, le=1_000_000_000)
    profit: float = Field(ge=-1_000_000_000, le=1_000_000_000)
    off_days: int = Field(ge=0, le=7)


def require_token(x_ai_token: str | None = Header(default=None)) -> None:
    if not AI_SERVICE_TOKEN:
        return
    if not x_ai_token or not hmac.compare_digest(x_ai_token, AI_SERVICE_TOKEN):
        raise HTTPException(status_code=401, detail="Invalid AI service token")


@app.get("/health")
def health():
    return {"status": "ok", "models": "loaded", "tokenRequired": bool(AI_SERVICE_TOKEN)}


@app.post("/predict", dependencies=[Depends(require_token)])
def predict(data: WeeklyFeatures):
    df = pd.DataFrame([data.model_dump()], columns=FEATURES)

    try:
        predicted_revenue = max(0, int(revenue_model.predict(df)[0]))
        predicted_profit = int(profit_model.predict(df)[0])
    except Exception as error:  # noqa: BLE001 - surface a clean 500, never a stack to the caller
        raise HTTPException(status_code=500, detail="Model prediction failed") from error

    # Trend logic
    trend = "up" if predicted_profit > data.profit else "down"

    # Simple insights
    insights = []

    if data.off_days > 0:
        insights.append("Reducing off-days may increase weekly revenue")

    if data.total_expense > data.week_revenue * 0.75:
        insights.append("High expenses are impacting profitability")

    if data.week_orders > 300:
        insights.append("Strong demand detected this week")

    return {
        "predicted_revenue": predicted_revenue,
        "predicted_profit": predicted_profit,
        "trend": trend,
        "insights": insights,
    }
