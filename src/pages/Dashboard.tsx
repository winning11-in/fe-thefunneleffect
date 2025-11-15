import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  FileText,
  Users,
  Activity,
  Eye,
  TrendingUp,
  DollarSign,
  Music,
  ListMusic,
} from "lucide-react";
import Charts from "../components/Charts";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchDashboardData } from "../store/slices/dashboardSlice";

const Dashboard: React.FC = () => {
  // Hard coded stats
  const stats = [
    { title: "Total Pages", value: 156, icon: FileText, color: "#2196f3" },
    { title: "Total Tracks", value: 89, icon: Music, color: "#ff5722" },
    { title: "Total Playlists", value: 23, icon: ListMusic, color: "#673ab7" },
    { title: "Total Users", value: 1250, icon: Users, color: "#4caf50" },
    { title: "Active Pages", value: 45, icon: Activity, color: "#ff9800" },
    { title: "Views Today", value: 3200, icon: Eye, color: "#9c27b0" },
    { title: "Growth Rate", value: "+12%", icon: TrendingUp, color: "#00bcd4" },
    { title: "Revenue", value: "$24,500", icon: DollarSign, color: "#8bc34a" },
  ];

  const dispatch = useAppDispatch();
  const { loading, error, lastFetched } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    const CACHE_DURATION = 5 * 60 * 1000;
    const shouldFetch =
      !lastFetched || Date.now() - lastFetched > CACHE_DURATION;

    if (shouldFetch) {
      dispatch(fetchDashboardData());
    }
  }, [dispatch, lastFetched]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" component="h1" gutterBottom sx={{ mb: 2 }}>
        Dashboard
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6, mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            {loading ? (
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "none",
                  border: "1px solid #e0e0e0",
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <Skeleton variant="circular" width={24} height={24} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={28} />
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Card
                sx={{
                  color: stat.color,
                  borderRadius: 2,
                  border: `2px solid ${stat.color}`,
                  boxShadow: "none",
                }}
              >
                <CardContent sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <stat.icon size={24} />
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h6">{stat.value}</Typography>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        ))}
      </Grid>

      <Charts loading={loading} />
    </Box>
  );
};

export default Dashboard;
