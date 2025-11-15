import React from "react";
import { Box, Typography, Grid, Skeleton } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface ChartsProps {
  loading?: boolean;
}

const Charts: React.FC<ChartsProps> = ({ loading = false }) => {
  // Hard coded data for charts
  const barData = [
    { name: "Mon", views: 400 },
    { name: "Tue", views: 300 },
    { name: "Wed", views: 500 },
    { name: "Thu", views: 280 },
    { name: "Fri", views: 590 },
    { name: "Sat", views: 320 },
    { name: "Sun", views: 450 },
  ];

  const lineData = [
    { name: "Jan", users: 400 },
    { name: "Feb", users: 300 },
    { name: "Mar", users: 600 },
    { name: "Apr", users: 800 },
    { name: "May", users: 500 },
    { name: "Jun", users: 700 },
  ];

  const pieData = [
    { name: "Published", value: 60, color: "#2196f3" },
    { name: "Draft", value: 30, color: "#4caf50" },
    { name: "Archived", value: 10, color: "#ff9800" },
  ];

  const areaData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 5000 },
    { name: "Apr", revenue: 4500 },
    { name: "May", revenue: 6000 },
    { name: "Jun", revenue: 5500 },
  ];

  return (
    <Box sx={{ mt: 6 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 4 }}>
        Analytics Charts
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 2, fontSize: "13px" }}
          >
            Page Views This Week
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: 1 }} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#2196f3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 2, fontSize: "13px" }}
          >
            User Growth Trend
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: 1 }} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#4caf50"
                  strokeWidth={3}
                  dot={{ fill: "#4caf50", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ mb: 2, fontSize: "13px" }}
          >
            Page Status Distribution
          </Typography>
          {loading ? (
            <Skeleton variant="circular" width={160} height={160} sx={{ mx: "auto", mt: 2 }} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{ fontSize: "13px", mb: 2 }}
          >
            Revenue Trend
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={250} sx={{ borderRadius: 1 }} />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#9c27b0"
                  fill="#9c27b0"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Charts;
