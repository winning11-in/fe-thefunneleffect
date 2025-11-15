import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Alert,
  Button,
  Container,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  PhoneAndroid as MobileIcon,
  Tablet as TabletIcon,
  DesktopWindows as DesktopIcon,
} from "@mui/icons-material";
import { pagesAPI } from "../services/api";
import type { Page } from "../types";

const PagePreview: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceView, setDeviceView] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const response = await pagesAPI.getBySlug(slug);
        setPage(response.data);
      } catch (err) {
        console.error("Error fetching page:", err);
        setError("Failed to load page preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !page) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || "Page not found"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/pages")}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back to Pages
        </Button>
      </Container>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/pages")}
          variant="outlined"
          sx={{
            mb: 2,
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500,
          }}
        >
          Back to Pages
        </Button>

        <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 1 }}>
          <IconButton
            onClick={() => setDeviceView("mobile")}
            color={deviceView === "mobile" ? "primary" : "default"}
            sx={{
              border: deviceView === "mobile" ? "2px solid" : "1px solid",
              borderColor: deviceView === "mobile" ? "primary.main" : "divider",
            }}
          >
            <MobileIcon />
          </IconButton>
          <IconButton
            onClick={() => setDeviceView("tablet")}
            color={deviceView === "tablet" ? "primary" : "default"}
            sx={{
              border: deviceView === "tablet" ? "2px solid" : "1px solid",
              borderColor: deviceView === "tablet" ? "primary.main" : "divider",
            }}
          >
            <TabletIcon />
          </IconButton>
          <IconButton
            onClick={() => setDeviceView("desktop")}
            color={deviceView === "desktop" ? "primary" : "default"}
            sx={{
              border: deviceView === "desktop" ? "2px solid" : "1px solid",
              borderColor: deviceView === "desktop" ? "primary.main" : "divider",
            }}
          >
            <DesktopIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Card
          sx={{
            width: deviceView === "mobile" ? "540px" : deviceView === "tablet" ? "770px" : "100%",
            maxWidth: deviceView === "desktop" ? "1440px" : "none",
            mx: "auto",
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <CardContent
            sx={{
              p: 3,
              height: "100%",
              overflow: "auto",
            }}
          >
            {page.content && (
              <Box sx={{ mt: 3 }}>
                <div dangerouslySetInnerHTML={{ __html: page.content }} />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PagePreview;
