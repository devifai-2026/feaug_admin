import {
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  ArrowUpIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import RecentOrders from "./RecentOrders";
import StatCard from "./StatCard";
import CircularProgress from "./CircularProgress";
import LineChart from "./LineChart";
import ProgressChart from "./ProgressChart";
import dashboardApi from "../../src/api/dashboard.api";
import { useAuth } from "../../src/context/AuthContext";
import { Line } from "react-chartjs-2";

const MainContent = ({ sidebarOpen }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("yearly");
  const [selectedGrowthPeriod, setSelectedGrowthPeriod] = useState("8weeks");
  const { user } = useAuth();

  const iconMap = {
    CurrencyDollarIcon: CurrencyDollarIcon,
    UserGroupIcon: UserGroupIcon,
    ShoppingCartIcon: ShoppingCartIcon,
    ChartBarIcon: ChartBarIcon,
    ArrowTrendingUpIcon: ArrowTrendingUpIcon,
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUserGrowthData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardApi.getDashboardStats();
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGrowthData = async (period = "8weeks") => {
    try {
      const response = await dashboardApi.getUserGrowth(period);
      if (response && response.data && response.data.userGrowthProgress) {
        setDashboardData((prev) => ({
          ...prev,
          userGrowthProgress: response.data.userGrowthProgress,
        }));
      }
    } catch (err) {
      console.error("Error fetching user growth data:", err);
      // Set default data if API fails
      if (dashboardData) {
        setDashboardData((prev) => ({
          ...prev,
          userGrowthProgress: getDefaultUserGrowthData(),
        }));
      }
    }
  };

  // Default fallback data
  const getDefaultUserGrowthData = () => {
    return {
      labels: [
        "Week 1",
        "Week 2",
        "Week 3",
        "Week 4",
        "Week 5",
        "Week 6",
        "Week 7",
        "Week 8",
      ],
      datasets: [
        {
          label: "New Users",
          data: [120, 190, 300, 500, 750, 1100, 1650, 2350],
          borderColor: "rgb(139, 92, 246)",
          backgroundColor: "rgba(139, 92, 246, 0.1)",
          fill: true,
        },
        {
          label: "Conversion Rate %",
          data: [1.2, 1.8, 2.5, 3.2, 4.1, 5.0, 6.2, 7.5],
          borderColor: "rgb(14, 165, 233)",
          backgroundColor: "transparent",
        },
      ],
      weeklyGrowth: 10.7,
      newUsersThisWeek: 2350,
      conversionRate: 7.5,
    };
  };

  const handleSetTarget = async () => {
    try {
      const targetAmount = prompt("Enter monthly target amount:");
      if (targetAmount) {
        await dashboardApi.setMonthlyTarget({
          targetValue: parseFloat(targetAmount),
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (err) {
      console.error("Error setting target:", err);
      alert("Failed to set target. Please try again.");
    }
  };

  const handlePeriodChange = async (period) => {
    setSelectedPeriod(period);
    try {
      const response = await dashboardApi.getRevenueOverview(period);
      if (response && response.data && response.data.revenueOverview) {
        setDashboardData((prev) => ({
          ...prev,
          revenueOverview: response.data.revenueOverview,
        }));
      }
    } catch (err) {
      console.error("Error changing period:", err);
    }
  };

  const handleGrowthPeriodChange = async (period) => {
    setSelectedGrowthPeriod(period);
    await fetchUserGrowthData(period);
  };

  if (loading) {
    return (
      <main
        className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? "lg:pl-6" : "lg:pl-6"}`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main
        className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? "lg:pl-6" : "lg:pl-6"}`}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to load dashboard
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                fetchDashboardData();
                fetchUserGrowthData();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main
        className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? "lg:pl-6" : "lg:pl-6"}`}
      >
        <div className="text-center py-12">
          <p className="text-gray-600">No dashboard data available</p>
        </div>
      </main>
    );
  }

  const {
    stats = [],
    monthlyTarget = {},
    revenueOverview = {},
    recentOrders = [],
    performanceMetrics = {},
    userGrowthProgress = {},
    targetInsights = {},
  } = dashboardData;

  const formatCurrency = (value) => {
    if (typeof value === "number") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value);
    }
    return value;
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "CurrencyDollarIcon":
        return <CurrencyDollarIcon className="h-6 w-6 text-white" />;
      case "UserGroupIcon":
        return <UserGroupIcon className="h-6 w-6 text-white" />;
      case "ShoppingCartIcon":
        return <ShoppingCartIcon className="h-6 w-6 text-white" />;
      case "ChartBarIcon":
      case "TargetIcon":
        return <ChartBarIcon className="h-6 w-6 text-white" />;
      case "ArrowTrendingUpIcon":
        return <ArrowTrendingUpIcon className="h-6 w-6 text-white" />;
      default:
        return <CurrencyDollarIcon className="h-6 w-6 text-white" />;
    }
  };

  return (
    <main
      className={`flex-1 overflow-y-auto bg-gray-50 p-6 transition-all duration-300 ${sidebarOpen ? "lg:pl-6" : "lg:pl-6"}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || "Admin"}! Here's what's happening
            today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || CurrencyDollarIcon;
            return (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={getIconComponent(stat.icon)}
                color={stat.color}
              />
            );
          })}
        </div>

        {/* Charts and Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Target Card */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Monthly Target
                </h2>
                <p className="text-sm text-gray-500">
                  {monthlyTarget.hasTarget
                    ? "Current monthly revenue target"
                    : "No monthly target set"}
                </p>
              </div>
              <button
                onClick={handleSetTarget}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {monthlyTarget.hasTarget ? "Edit Target" : "Set Target"} →
              </button>
            </div>

            {monthlyTarget.hasTarget ? (
              <>
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  <div className="flex-shrink-0">
                    <CircularProgress
                      percentage={monthlyTarget.progress}
                      size={160}
                      strokeWidth={12}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="space-y-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <ArrowUpIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {monthlyTarget.increaseFromLastMonth > 0
                                  ? "+"
                                  : ""}
                                {monthlyTarget.increaseFromLastMonth}%
                              </p>
                              <p className="text-xs text-gray-500">
                                Increase from last month
                              </p>
                            </div>
                          </div>
                          <span className="text-2xl font-bold text-gray-900">
                            {monthlyTarget.progress?.toFixed(1) || 0}%
                          </span>
                        </div>
                      </div>

                      {monthlyTarget.todayEarnings > 0 && (
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">
                              You earned{" "}
                              {formatCurrency(monthlyTarget.todayEarnings)}{" "}
                              today
                            </span>
                            , it's{" "}
                            {monthlyTarget.increaseFromLastMonth > 0
                              ? "higher"
                              : "lower"}{" "}
                            than last month.{" "}
                            {monthlyTarget.increaseFromLastMonth > 0
                              ? "Keep up your good work!"
                              : "Keep pushing!"}
                          </p>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Target</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(monthlyTarget.target)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Current Earnings
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(monthlyTarget.currentEarnings)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Remaining
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(monthlyTarget.remaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {monthlyTarget.daysElapsed?.total -
                        monthlyTarget.daysElapsed?.remaining}{" "}
                      days elapsed
                    </span>
                    <span className="text-gray-600">
                      {monthlyTarget.daysElapsed?.remaining} days remaining
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <ChartBarIcon className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Target Set
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {targetInsights.recommendation ||
                    "Set a monthly revenue target to track your performance better."}
                </p>
                <button
                  onClick={handleSetTarget}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg text-sm font-medium transition-colors"
                >
                  Set Your First Target
                </button>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <RecentOrders
            orders={recentOrders}
            totalCount={stats.find((s) => s.title === "Total Orders")?.valueRaw}
          />
        </div>

        {/* Full Width Revenue Chart */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Revenue Overview
              </h2>
              <p className="text-sm text-gray-500">Monthly revenue vs target</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                <option value="thismonth">This Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
            </div>
          </div>

          {revenueOverview.datasets ? (
            <LineChart data={revenueOverview} height={300} />
          ) : (
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No revenue data available</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Current Month</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(revenueOverview.summary?.currentMonth || 0)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Target</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(revenueOverview.summary?.target || 0)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Growth</p>
              <p
                className={`text-xl font-bold ${revenueOverview.summary?.growth > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {revenueOverview.summary?.growth > 0 ? "+" : ""}
                {revenueOverview.summary?.growth || 0}%
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg. Monthly</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(revenueOverview.summary?.avgMonthly || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* User Growth Progress Chart */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                User Growth Progress
              </h2>
              <p className="text-sm text-gray-500">
                Weekly user acquisition and conversion rates
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                value={selectedGrowthPeriod}
                onChange={(e) => handleGrowthPeriodChange(e.target.value)}
              >
                <option value="8weeks">Last 2 Month</option>
                <option value="4weeks">Last 1 Month</option>
                <option value="12weeks">Last 3 Month</option>
              </select>
              {/* <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Details →
              </button> */}
            </div>
          </div>

          <div className="relative">
            {userGrowthProgress && userGrowthProgress.datasets ? (
              <ProgressChart data={userGrowthProgress} />
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No user growth data available</p>
              </div>
            )}
          </div>

          {/* Detailed Summary Section */}

          {userGrowthProgress?.summary && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              {/* Header with decorative element */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Performance Insights
                    </h3>
                    <p className="text-sm text-gray-500">
                      Detailed analytics for user growth and conversion
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {userGrowthProgress.summary.period === "4weeks"
                      ? "Last 1 Month"
                      : userGrowthProgress.summary.period === "8weeks"
                        ? "Last 2 Months"
                        : userGrowthProgress.summary.period === "12weeks"
                          ? "Last 3 Months"
                          : "Custom Period"}
                  </span>
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* User Acquisition Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100 p-5 shadow-sm">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-transparent rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-3 shadow-sm">
                        <UserGroupIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          User Acquisition
                        </h4>
                        <p className="text-xs text-gray-500">
                          New registered users
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total New Users
                        </span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900">
                            {userGrowthProgress.summary.totalNewUsers?.toLocaleString(
                              "en-IN",
                            ) || 0}
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                            {userGrowthProgress.summary.weeksCount || 0} weeks
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Avg. Weekly Users
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {userGrowthProgress.summary.avgWeeklyUsers?.toLocaleString(
                            "en-IN",
                          ) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Visitor to User Rate
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {userGrowthProgress.summary.visitorToUserRate?.toFixed(
                              2,
                            ) || 0}
                            %
                          </span>
                          <div className="ml-2 h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(userGrowthProgress.summary.visitorToUserRate || 0, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visitor Analytics Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 p-5 shadow-sm">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100 to-transparent rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mr-3 shadow-sm">
                        <ChartBarIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Visitor Analytics
                        </h4>
                        <p className="text-xs text-gray-500">
                          Traffic & engagement metrics
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-sm text-gray-600">
                          Total Visitors
                        </span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900">
                            {userGrowthProgress.summary.totalVisitors?.toLocaleString(
                              "en-IN",
                            ) || 0}
                          </span>
                          <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                            Unique sessions
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Avg. Weekly Visitors
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {userGrowthProgress.summary.avgWeeklyVisitors?.toLocaleString(
                            "en-IN",
                          ) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Total Orders
                        </span>
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {userGrowthProgress.summary.totalOrders?.toLocaleString(
                              "en-IN",
                            ) || 0}
                          </span>
                          {userGrowthProgress.summary.totalOrders > 0 && (
                            <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                              {(
                                (userGrowthProgress.summary.totalOrders /
                                  userGrowthProgress.summary.totalVisitors) *
                                100
                              ).toFixed(1)}
                              % conversion
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Week Performance Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white to-emerald-50 rounded-xl border border-emerald-100 p-5 shadow-sm">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-100 to-transparent rounded-full -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mr-3 shadow-sm">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">
                          Recent Week Performance
                        </h4>
                        <p className="text-xs text-gray-500">
                          Latest weekly snapshot
                        </p>
                      </div>
                    </div>
                    {userGrowthProgress.summary.mostRecentWeek ? (
                      <div className="space-y-4">
                        <div className="pb-3 border-b border-gray-100">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            Week of
                          </p>
                          <p className="text-sm font-semibold text-gray-900 flex items-center">
                            {userGrowthProgress.summary.mostRecentWeek.label ||
                              "Last Week"}
                            {userGrowthProgress.summary.mostRecentWeek
                              .newUsers > 0 && (
                              <span className="ml-2 text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                                Active
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {userGrowthProgress.summary.mostRecentWeek.visitors?.toLocaleString(
                                "en-IN",
                              ) || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              Visitors
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {userGrowthProgress.summary.mostRecentWeek.newUsers?.toLocaleString(
                                "en-IN",
                              ) || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              New Users
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {userGrowthProgress.summary.mostRecentWeek.orders?.toLocaleString(
                                "en-IN",
                              ) || 0}
                            </div>
                            <div className="text-xs text-gray-500">Orders</div>
                          </div>
                        </div>
                        {userGrowthProgress.summary.mostRecentWeek.conversion >
                          0 && (
                          <div className="pt-3 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Week Conversion
                              </span>
                              <span className="text-sm font-semibold text-emerald-600">
                                {userGrowthProgress.summary.mostRecentWeek.conversion.toFixed(
                                  2,
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">
                          No recent week data available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Highlights */}
              <div className="mb-8">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-amber-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Performance Highlights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Peak Performance Card */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-amber-700">
                          Peak Week Users
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {Math.max(
                            ...(userGrowthProgress?.datasets?.[0]?.data || [0]),
                          )}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-amber-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600">
                      {(() => {
                        const userData =
                          userGrowthProgress?.datasets?.[0]?.data || [];
                        if (userData.length === 0) return "No peak week data";
                        const maxIndex = userData.indexOf(
                          Math.max(...userData),
                        );
                        return `Achieved in ${userGrowthProgress?.labels?.[maxIndex] || "previous week"}`;
                      })()}
                    </p>
                  </div>

                  {/* Conversion Excellence Card */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-green-700">
                          Peak Conversion Rate
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {Math.max(
                            ...(userGrowthProgress?.datasets?.[1]?.data || [0]),
                          ).toFixed(2)}
                          %
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-green-600">
                      Highest weekly conversion achieved
                    </p>
                  </div>

                  {/* Engagement Card */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-blue-700">
                          Order per User Ratio
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {userGrowthProgress.summary.totalNewUsers > 0
                            ? (
                                userGrowthProgress.summary.totalOrders /
                                userGrowthProgress.summary.totalNewUsers
                              ).toFixed(2)
                            : 0}
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600">
                      Average orders per registered user
                    </p>
                  </div>

                  {/* Growth Trend Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-medium text-purple-700">
                          Weekly Growth Trend
                        </p>
                        <p
                          className={`text-xl font-bold ${userGrowthProgress?.weeklyGrowth > 0 ? "text-green-600" : "text-red-600"}`}
                        >
                          {userGrowthProgress?.weeklyGrowth > 0 ? "+" : ""}
                          {userGrowthProgress?.weeklyGrowth || 0}%
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        {userGrowthProgress?.weeklyGrowth > 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-purple-600" />
                        ) : (
                          <svg
                            className="h-4 w-4 text-purple-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-purple-600">
                      Week-over-week user growth change
                    </p>
                  </div>
                </div>
              </div>

              {/* Conversion Breakdown */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">
                    Conversion Analysis
                  </h4>
                  <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {userGrowthProgress.summary.weeksCount || 0} week analysis
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Overall Conversion */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Overall Conversion Rate
                        </p>
                        <p className="text-xs text-gray-500">
                          Total period performance
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {userGrowthProgress.conversionRate?.toFixed(2) || 0}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {userGrowthProgress.summary.totalOrders || 0} orders /{" "}
                          {userGrowthProgress.summary.totalVisitors || 0}{" "}
                          visitors
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(userGrowthProgress.conversionRate || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Visitor-to-User Conversion */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Visitor to User Conversion
                        </p>
                        <p className="text-xs text-gray-500">
                          Sign-up rate from visitors
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {userGrowthProgress.summary.visitorToUserRate?.toFixed(
                            2,
                          ) || 0}
                          %
                        </p>
                        <p className="text-xs text-gray-500">
                          {userGrowthProgress.summary.totalNewUsers || 0} users
                          / {userGrowthProgress.summary.totalVisitors || 0}{" "}
                          visitors
                        </p>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(userGrowthProgress.summary.visitorToUserRate || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Additional Insights */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {userGrowthProgress.summary.avgWeeklyUsers || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg. Weekly Users
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {userGrowthProgress.summary.avgWeeklyVisitors || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        Avg. Weekly Visitors
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">
                        {userGrowthProgress.summary.avgWeeklyVisitors > 0
                          ? (
                              (userGrowthProgress.summary.avgWeeklyUsers /
                                userGrowthProgress.summary.avgWeeklyVisitors) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                      <div className="text-xs text-gray-500">
                        Weekly Sign-up Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="mt-6 rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-semibold mb-6">Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {performanceMetrics.conversionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {performanceMetrics.avgSessionDuration || 0}s
              </div>
              <div className="text-sm text-gray-600">Avg. Session</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {performanceMetrics.bounceRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Bounce Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {performanceMetrics.newSessions || 0}%
              </div>
              <div className="text-sm text-gray-600">New Sessions</div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-indigo-600 mb-2">
                {formatCurrency(performanceMetrics.avgOrderValue || 0)}
              </div>
              <div className="text-sm text-gray-600">Avg Order Value</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-pink-600 mb-2">
                {performanceMetrics.targetCompletionRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Target Completion</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-cyan-600 mb-2">
                {performanceMetrics.orderFulfillmentRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Fulfillment Rate</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {formatCurrency(performanceMetrics.avgRevenuePerUser || 0)}
              </div>
              <div className="text-sm text-gray-600">Revenue Per User</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;
