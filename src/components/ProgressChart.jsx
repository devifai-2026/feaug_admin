import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressChart = ({ data: userGrowthProgress }) => {
  // Use actual data from API
  const labels = userGrowthProgress?.labels || [];
  
  // Get datasets from API
  const apiDatasets = userGrowthProgress?.datasets || [];
  
  const chartData = {
    labels,
    datasets: apiDatasets.length > 0 ? apiDatasets : [
      {
        label: "New Users",
        data: [],
        borderColor: "rgb(139, 92, 246)",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.5,
        pointBackgroundColor: "rgb(139, 92, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: "Conversion Rate %",
        data: [],
        borderColor: "rgb(14, 165, 233)",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.5,
        pointBackgroundColor: "rgb(14, 165, 233)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: "y1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: "500"
          }
        }
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#111827",
        bodyColor: "#374151",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              if (context.dataset.label.includes("Conversion")) {
                label += context.parsed.y.toFixed(2) + "%";
              } else {
                label += context.parsed.y.toLocaleString("en-IN") + " users";
              }
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "New Users",
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString("en-IN");
          }
        },
        beginAtZero: true
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Conversion Rate %",
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(1) + "%";
          },
        },
        beginAtZero: true
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  return (
    <div className="h-80">
      {labels.length > 0 ? (
        <Line data={chartData} options={options} />
      ) : (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;
