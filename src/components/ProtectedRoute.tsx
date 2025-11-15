import React, { ReactNode } from "react";
import { Box, Skeleton } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
        <Box
          sx={{
            width: 60,
            bgcolor: "#4440cc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 2,
          }}
        >
          <Skeleton
            variant="circular"
            width={32}
            height={32}
            sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 4 }}
          />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              width={40}
              height={40}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 2, borderRadius: 1 }}
            />
          ))}
        </Box>

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={400}
            sx={{ borderRadius: 2 }}
          />
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
