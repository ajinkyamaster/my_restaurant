const express = require('express'); 

const router = express.Router();

// AI Growth Trend Analysis Page
router.get('/aiGrowthTrendAnalysis', async (req, res) => {
  try {
    // 🔹 Mock / last-week data (replace with DB data later)
    const currentWeekData = {
      week_revenue: 275000,
      week_orders: 350,
      avg_order_value: 785,
      total_expense: 175000,
      profit: 100000,
      off_days: 0
    };

    // 🔹 Call FastAPI service
    const aiResponse = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(currentWeekData)
    });

    if (!aiResponse.ok) {
      throw new Error("Failed to fetch AI predictions");
    }

    const aiData = await aiResponse.json();

    // 🔹 Last 4 weeks history (mock for now)
    const history = [
      { week: "W-1", revenue: 275000, total_expense: 200000 },
      { week: "W-2", revenue: 270000, total_expense: 280000 },
      { week: "W-3", revenue: 300000, total_expense: 200000 },
      { week: "W-4", revenue: 280000, total_expense: 220000 }
    ];

    // 🔹 Render page with AI data
    res.render("admin/growthTrendAnalysis", {
      admin: req.session.admin,
      history,
      prediction: {
        revenue: aiData.predicted_revenue,
        profit: aiData.predicted_profit
      },
      trend: aiData.trend,
      insights: aiData.insights
    });

  } catch (error) {
    console.error("AI Growth Trend Error:", error);

    res.status(500).render("admin/growthTrendAnalysis", {
      admin: req.session.admin,
      history: [],
      prediction: { revenue: 0, profit: 0 },
      trend: "unknown",
      insights: ["AI service temporarily unavailable"]
    });
  }
});


module.exports = router;