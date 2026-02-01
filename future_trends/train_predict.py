import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.metrics import r2_score


# Load dataset
data = pd.read_csv("weekly_restaurant_data.csv")

# Features
X = data[
    [
        "week_revenue",
        "week_orders",
        "avg_order_value",
        "total_expense",
        "profit",
        "off_days"
    ]
]

# Labels
y_revenue = data["next_week_revenue"]
y_profit = data["next_week_profit"]

# Train-test split
X_train, X_test, y_rev_train, y_rev_test = train_test_split(
    X, y_revenue, test_size=0.2, random_state=42
)

_, _, y_profit_train, y_profit_test = train_test_split(
    X, y_profit, test_size=0.2, random_state=42
)

# Revenue model
revenue_model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)
revenue_model.fit(X_train, y_rev_train)

# Profit model
profit_model = RandomForestRegressor(
    n_estimators=200,
    random_state=42
)
profit_model.fit(X_train, y_profit_train)

# Evaluation
rev_preds = revenue_model.predict(X_test)
profit_preds = profit_model.predict(X_test)

rev_mae = mean_absolute_error(y_rev_test, rev_preds)
profit_mae = mean_absolute_error(y_profit_test, profit_preds)

rev_r2 = r2_score(y_rev_test, rev_preds)
profit_r2 = r2_score(y_profit_test, profit_preds)

print("Revenue MAE:", rev_mae)
print("Revenue R2 Score:", round(rev_r2, 3))

print("Profit MAE:", profit_mae)
print("Profit R2 Score:", round(profit_r2, 3))


# Feature Importance
feature_names = X.columns

revenue_importance = revenue_model.feature_importances_
profit_importance = profit_model.feature_importances_

rev_importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": revenue_importance
}).sort_values(by="importance", ascending=False)

profit_importance_df = pd.DataFrame({
    "feature": feature_names,
    "importance": profit_importance
}).sort_values(by="importance", ascending=False)

print("\n--- Revenue Model Feature Importance ---")
print(rev_importance_df)

print("\n--- Profit Model Feature Importance ---")
print(profit_importance_df)



# Sample prediction (new week)
new_week = pd.DataFrame(
    [[275000, 350, 785, 175000, 100000, 0]],
    columns=X.columns
)

predicted_revenue = revenue_model.predict(new_week)[0]
predicted_profit = profit_model.predict(new_week)[0]

print("Predicted Next Week Revenue:", int(predicted_revenue))
print("Predicted Next Week Profit:", int(predicted_profit))


import joblib

joblib.dump(revenue_model, "revenue_model.pkl")
joblib.dump(profit_model, "profit_model.pkl")

print("Models saved successfully")

