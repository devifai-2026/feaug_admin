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

// Register ChartJS components
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

const LineChart = ({ data: revenueData }) => {
  // Premium color scheme
  console.log({ revenueData });
  const colors = {
    revenue: {
      border: "rgba(59, 130, 246, 1)",
      fill: "rgba(59, 130, 246, 0.08)",
      point: "rgba(59, 130, 246, 1)",
    },
    target: {
      border: "rgba(34, 197, 94, 1)",
      fill: "transparent",
      point: "rgba(34, 197, 94, 1)",
    },
    grid: "rgba(229, 231, 235, 0.3)",
    text: "rgba(107, 114, 128, 0.8)",
  };

  // Get current date to determine years
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear(); // 2026
  const currentMonth = currentDate.getMonth(); // 0 = Jan, 1 = Feb, ...

  // Month names
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Function to generate labels with correct years
  const generateLabelsWithYears = (apiLabels) => {
    if (!apiLabels || apiLabels.length === 0) {
      return [];
    }

    // First, find the current month in the labels array
    const currentMonthName = monthNames[currentMonth];
    const currentIndex = apiLabels.findIndex(label => 
      label.toLowerCase().includes(currentMonthName.toLowerCase())
    );

    const labelsWithYears = [];
    
    apiLabels.forEach((label, index) => {
      const monthName = label.split(' ')[0]; // Extract month name from label
      let year = currentYear;
      
      // If we found current month in the array
      if (currentIndex !== -1) {
        // For months before current month in the array, they're from current year
        // For months after current month in the array, they're from previous year
        if (index > currentIndex) {
          year = currentYear - 1;
        }
      } else {
        // If current month not in array, assume all months are from current year
        // unless it's early in the year and we have months like Nov, Dec which would be from previous year
        const monthIndex = monthNames.findIndex(m => 
          m.toLowerCase() === monthName.toLowerCase()
        );
        if (monthIndex > currentMonth) {
          year = currentYear - 1;
        }
      }
      
      labelsWithYears.push(`${monthName}`);
    });

    return labelsWithYears;
  };

  // Get API data
  const apiRevenueData = revenueData?.datasets?.[0]?.data || [];
  const apiTargetData = revenueData?.datasets?.[1]?.data || [];
  const apiLabels = revenueData?.labels || [];

  // Generate labels with years
  const labels = generateLabelsWithYears(apiLabels);

  // Use the exact data from API (don't map to full year)
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Revenue",
        data: apiRevenueData,
        borderColor: colors.revenue.border,
        backgroundColor: colors.revenue.fill,
        tension: 0.4,
        pointBackgroundColor: colors.revenue.point,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        fill: {
          target: "origin",
          above: colors.revenue.fill,
        },
      },
      {
        label: "Target",
        data: apiTargetData,
        borderColor: colors.target.border,
        backgroundColor: colors.target.fill,
        borderDash: revenueData?.datasets?.[1]?.borderDash || [5, 5],
        tension: 0.4,
        pointBackgroundColor: colors.target.point,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          boxWidth: 8,
          padding: 16,
          usePointStyle: true,
          pointStyle: "circle",
          font: {
            size: 12,
            family:
              "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            weight: "500",
          },
          color: colors.text,
          generateLabels: (chart) => {
            const { data: chartData } = chart;
            if (chartData.datasets.length) {
              return chartData.datasets.map((dataset, i) => ({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
                hidden: !chart.isDatasetVisible(i),
                index: i,
              }));
            }
            return [];
          },
        },
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
        boxPadding: 6,
        titleFont: {
          size: 12,
          weight: "600",
          family: "'Inter', sans-serif",
        },
        bodyFont: {
          size: 13,
          family: "'Inter', sans-serif",
        },
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              if (value === 0) {
                label += "₹0 (No data)";
              } else {
                label += `₹${value.toLocaleString("en-IN")}`;
              }
            }
            return label;
          },
          labelColor: function (context) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
              borderWidth: 2,
              borderRadius: 2,
            };
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: colors.text,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: "400",
          },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: colors.grid,
          drawBorder: false,
          lineWidth: 1,
          drawTicks: false,
        },
        ticks: {
          color: colors.text,
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: "400",
          },
          padding: 8,
          callback: function (value) {
            if (value >= 100000) {
              return `₹${(value / 1000).toFixed(0)}k`;
            }
            return `₹${value.toLocaleString("en-IN")}`;
          },
        },
        border: {
          display: false,
        },
      },
    },
    animation: {
      duration: 1500,
      easing: "easeOutQuart",
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };



  return (
    <div className="relative h-80">
      <Line data={data} options={options} />

      {/* Chart summary overlay */}
      {/* <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-gray-700">Revenue</span>
            <span className="text-xs font-bold text-gray-900">
              ₹{revenueTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border-2 border-emerald-500"></div>
            <span className="text-xs font-medium text-gray-700">Target</span>
            <span className="text-xs font-bold text-gray-900">
              ₹{targetTotal.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default LineChart;