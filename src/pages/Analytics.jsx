import { useState } from "react";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "../css/Analytics.css";

const Analytics = () => {
  // Sample analytics data
  const [timeRange, setTimeRange] = useState("month");
  
  const wasteData = [
    { name: "Paper", amount: 1245, fill: "#81C784" },
    { name: "Glass", amount: 845, fill: "#4DB6AC" },
    { name: "Plastic", amount: 723, fill: "#FFB74D" },
    { name: "Metal", amount: 542, fill: "#90A4AE" },
    { name: "Organic", amount: 1568, fill: "#8D6E63" },
  ];

  const collectionStats = [
    { name: "Jan", collections: 45, recycled: 78 },
    { name: "Feb", collections: 52, recycled: 82 },
    { name: "Mar", collections: 48, recycled: 85 },
    { name: "Apr", collections: 60, recycled: 88 },
    { name: "May", collections: 65, recycled: 90 },
    { name: "Jun", collections: 70, recycled: 92 },
  ];

  const hotelPerformance = [
    { name: "Grand Plaza", recyclingRate: 92, wasteReduction: 15 },
    { name: "Seaside Resort", recyclingRate: 85, wasteReduction: 12 },
    { name: "Urban Suites", recyclingRate: 88, wasteReduction: 18 },
    { name: "Mountain Lodge", recyclingRate: 95, wasteReduction: 22 },
    { name: "Riverside Hotel", recyclingRate: 78, wasteReduction: 8 },
  ];

  const teamEfficiency = [
    { name: "Team Green", collections: 120, efficiency: 92 },
    { name: "Team Blue", collections: 115, efficiency: 88 },
    { name: "Team Red", collections: 98, efficiency: 85 },
    { name: "Team Yellow", collections: 105, efficiency: 90 },
  ];

  // Key metrics
  const totalWasteCollected = wasteData.reduce((sum, item) => sum + item.amount, 0);
  const avgRecyclingRate = Math.round(collectionStats.reduce((sum, item) => sum + item.recycled, 0) / collectionStats.length);
  const totalCollections = collectionStats.reduce((sum, item) => sum + item.collections, 0);

  return (
    <div className="content">
      <div className="analytics-header">
        <h2>Waste Management Analytics</h2>
        <div className="time-range-selector">
          <button 
            className={`time-range-btn ${timeRange === "week" ? "active" : ""}`}
            onClick={() => setTimeRange("week")}
          >
            Week
          </button>
          <button 
            className={`time-range-btn ${timeRange === "month" ? "active" : ""}`}
            onClick={() => setTimeRange("month")}
          >
            Month
          </button>
          <button 
            className={`time-range-btn ${timeRange === "year" ? "active" : ""}`}
            onClick={() => setTimeRange("year")}
          >
            Year
          </button>
        </div>
      </div>

      <div className="dashboard-cards">
        <div className="card">
          <div className="card-header">
            <h3>Total Waste Collected</h3>
            <span>🗑️</span>
          </div>
          <h4>{totalWasteCollected} kg</h4>
          <p>Across all waste types</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Avg. Recycling Rate</h3>
            <span>♻️</span>
          </div>
          <h4>{avgRecyclingRate}%</h4>
          <p>Of collected waste recycled</p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h3>Total Collections</h3>
            <span>🚛</span>
          </div>
          <h4>{totalCollections}</h4>
          <p>Completed this period</p>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Waste Composition Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h3>Waste Composition</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {wasteData.map((entry, index) => (
                    <Pie key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} kg`, "Amount"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Collection Trends Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h3>Collection Trends</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={collectionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="collections" stroke="#8884d8" name="Collections" />
                <Line yAxisId="right" type="monotone" dataKey="recycled" stroke="#82ca9d" name="Recycling Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hotel Performance Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h3>Hotel Performance</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hotelPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="recyclingRate" fill="#8884d8" name="Recycling Rate (%)" />
                <Bar yAxisId="right" dataKey="wasteReduction" fill="#82ca9d" name="Waste Reduction (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Efficiency Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h3>Team Efficiency</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamEfficiency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="collections" fill="#8884d8" name="Collections" />
                <Bar yAxisId="right" dataKey="efficiency" fill="#82ca9d" name="Efficiency (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Waste Reduction Metrics */}
        <div className="card metrics-card">
          <div className="card-header">
            <h3>Waste Reduction Metrics</h3>
          </div>
          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-value">15%</div>
              <div className="metric-label">Overall Reduction</div>
              <div className="metric-change positive">↑ 2% from last period</div>
            </div>
            <div className="metric">
              <div className="metric-value">92%</div>
              <div className="metric-label">Highest Recycling Rate</div>
              <div className="metric-detail">Grand Plaza Hotel</div>
            </div>
            <div className="metric">
              <div className="metric-value">22%</div>
              <div className="metric-label">Most Improved</div>
              <div className="metric-detail">Mountain Lodge</div>
            </div>
            <div className="metric">
              <div className="metric-value">95%</div>
              <div className="metric-label">Most Efficient Team</div>
              <div className="metric-detail">Team Green</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card activity-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">🚛</div>
              <div className="activity-content">
                <div className="activity-text">Team Blue completed collection at Seaside Resort</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">📊</div>
              <div className="activity-content">
                <div className="activity-text">Monthly recycling target achieved (92%)</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">🏨</div>
              <div className="activity-content">
                <div className="activity-text">New hotel onboarded: Harbor View</div>
                <div className="activity-time">3 days ago</div>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">👷</div>
              <div className="activity-content">
                <div className="activity-text">Team Red efficiency improved to 85%</div>
                <div className="activity-time">5 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;