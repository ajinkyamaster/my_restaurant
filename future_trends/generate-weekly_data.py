import pandas as pd
import random

weeks = 150

data = []

base_revenue = 150000
base_orders = 200
base_expense_ratio = 0.72

for week in range(weeks + 1):  # +1 for label shift
    growth_factor = 1 + (week * 0.004)
    noise = random.uniform(-0.05, 0.08)

    off_days = random.choice([0, 0, 0, 1, 1, 2])

    week_orders = int(base_orders * growth_factor * (1 + noise))
    avg_order_value = random.randint(720, 820)

    week_revenue = week_orders * avg_order_value
    expense_ratio = base_expense_ratio + random.uniform(-0.03, 0.04)

    if off_days > 0:
        week_revenue *= (1 - 0.06 * off_days)

    total_expense = int(week_revenue * expense_ratio)
    profit = int(week_revenue - total_expense)

    data.append([
        int(week_revenue),
        week_orders,
        avg_order_value,
        total_expense,
        profit,
        off_days
    ])

# Convert to DataFrame
df = pd.DataFrame(
    data,
    columns=[
        "week_revenue",
        "week_orders",
        "avg_order_value",
        "total_expense",
        "profit",
        "off_days"
    ]
)

# Create labels
df["next_week_revenue"] = df["week_revenue"].shift(-1)
df["next_week_profit"] = df["profit"].shift(-1)

# Drop last row (no label)
df = df[:-1]

# Save CSV
df.to_csv("weekly_restaurant_data.csv", index=False)

print("Dataset generated with", len(df), "weeks")
