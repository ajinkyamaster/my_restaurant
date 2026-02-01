document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("growthChart");
  if (!canvas) return;

  const history = JSON.parse(canvas.dataset.history || "[]");
  const predictedRevenue = Number(canvas.dataset.predictionRevenue);
  const predictedProfit = Number(canvas.dataset.predictionProfit);

  if (!history.length) {
    console.warn("No history data for chart");
    return;
  }

  const labels = history.map(h => h.week);
  const revenueData = history.map(h => h.revenue);
  const expenseData = history.map(h => h.total_expense);

  labels.push("Prediction");
  revenueData.push(predictedRevenue);
  expenseData.push(predictedRevenue - predictedProfit);   

  new Chart(canvas.getContext("2d"), {
    type: "line",
  data: {
    labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueData,
        borderColor: "#22c55e",
        backgroundColor: "rgba(212,175,55,0.15)",
        fill: true, // Shaded area
        pointRadius: 2,
        tension: 0.4
      },
      {
        label: "Total Expense",
        data: expenseData,
        borderColor: "#c71e0fff",
        backgroundColor: "rgba(199,30,15,0.15)",
        fill: true, // Shaded area
        pointRadius: 2,
        tension: 0.4
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false }, // Improved hover
    plugins: {
      legend: { position: 'bottom' }, // Moves legend to clear up space
    },
      scales: {
        x: {
          ticks: { color: "#aaa" },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        y: {
          ticks: { color: "#aaa" },
          grid: { color: "rgba(255,255,255,0.05)" }
        }
      }
    }
  });
});


