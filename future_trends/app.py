from fastapi import FastAPI
import pandas as pd
import joblib

app = FastAPI(title="Restaurant AI Analytics")

# Load models
revenue_model = joblib.load("revenue_model.pkl")
profit_model = joblib.load("profit_model.pkl")

FEATURES = [
    "week_revenue",
    "week_orders",
    "avg_order_value",
    "total_expense",
    "profit",
    "off_days"
]

@app.post("/predict")
def predict(data: dict):
    df = pd.DataFrame([data], columns=FEATURES)

    predicted_revenue = int(revenue_model.predict(df)[0])
    predicted_profit = int(profit_model.predict(df)[0])

    # Trend logic
    trend = "up" if predicted_profit > data["profit"] else "down"

    # Simple insights
    insights = []

    if data["off_days"] > 0:
        insights.append("Reducing off-days may increase weekly revenue")

    if data["total_expense"] > data["week_revenue"] * 0.75:
        insights.append("High expenses are impacting profitability")

    if data["week_orders"] > 300:
        insights.append("Strong demand detected this week")

    return {
        "predicted_revenue": predicted_revenue,
        "predicted_profit": predicted_profit,
        "trend": trend,
        "insights": insights
    }
