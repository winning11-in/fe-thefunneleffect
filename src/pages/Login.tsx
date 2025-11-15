import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
} from '@mui/icons-material'
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(formData.username, formData.password);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "#fff",
      }}
    >
      {/* Left side - Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 4,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 600,
            p: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 600,
              color: "#2c3e50",
              mb: 1,
              fontSize: { xs: "1.75rem", md: "2.125rem" },
            }}
          >
            Welcome back!
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#6c757d",
              mb: 4,
              fontSize: "1rem",
            }}
          >
            Enter your Credentials to access your account
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": {
                  fontSize: "0.9rem",
                },
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="body2"
              sx={{
                color: "#495057",
                mb: 1,
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              Username
            </Typography>
            <TextField
              fullWidth
              name="username"
              type="text"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                  border: "none",
                  "& fieldset": {
                    border: "1px solid #e9ecef",
                  },
                  "&:hover fieldset": {
                    border: "1px solid #ced4da",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #4CAF50",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "12px 14px",
                  fontSize: "1rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#6c757d", fontSize: "1.25rem" }} />
                  </InputAdornment>
                ),
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color: "#495057",
                mb: 1,
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              Password
            </Typography>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#f8f9fa",
                  border: "none",
                  "& fieldset": {
                    border: "1px solid #e9ecef",
                  },
                  "&:hover fieldset": {
                    border: "1px solid #ced4da",
                  },
                  "&.Mui-focused fieldset": {
                    border: "2px solid #4CAF50",
                  },
                },
                "& .MuiInputBase-input": {
                  padding: "12px 14px",
                  fontSize: "1rem",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#6c757d", fontSize: "1.25rem" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={togglePasswordVisibility}
                      edge="end"
                      sx={{ color: "#6c757d" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

 

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "6px 0",
                borderRadius: 2,
                fontSize: "1rem",
                fontWeight: 600,
                textTransform: "none",
                boxShadow: "none",

                mb: 3,
                mt: 2,
                "&:hover": {
                  backgroundColor: "#45a049",
                  boxShadow: "none",
                },
                "&:disabled": {
                  backgroundColor: "#c8e6c9",
                },
              }}
            >
              {loading ? "Signing in..." : "Login"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#6c757d",
                  fontSize: "0.875rem",
                }}
              >
                Don't have an account?{" "}
                <Link
                  component={RouterLink}
                  to="/signup"
                  sx={{
                    color: "#4CAF50",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Right side - Image */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          backgroundImage:
            'url("https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        {/* Optional overlay content can go here */}
      </Box>
    </Box>
  );
};

export default Login;
