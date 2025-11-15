import React, { useState, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Home,
  LayoutDashboard,
  FileText,
  LogOut,
  Music,
  ListMusic,
  Upload,
  AudioLines
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType;
  current: boolean;
}

const drawerWidth = 60;

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigation: NavigationItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      current: location.pathname === "/",
    },
    {
      name: "All Pages",
      href: "/pages",
      icon: FileText,
      current: location.pathname === "/pages",
    },
    {
      name: "Tracks",
      href: "/tracks",
      icon: Music,
      current: location.pathname === "/tracks",
    },
    {
      name: "Playlists",
      href: "/playlists",
      icon: ListMusic,
      current: location.pathname === "/playlists",
    },
  ];

  const isCollapsed = !isMobile;

  const drawer = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#4440cc",
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
        >
          <Home color="#fff" />
          {!isCollapsed && (
            <Typography variant="h6" noWrap component="div" sx={{ ml: 1 }}>
              DA CMS
            </Typography>
          )}
        </Box>
        <Divider />
        <List>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <ListItem key={item.name} disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  sx={{
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    px: 1,
                    mt: 2,
                    backgroundColor: item.current ? "#5a55d8" : "transparent",
                    "&:hover": {
                      backgroundColor: item.current
                        ? "#5a55d8"
                        : "rgba(255, 255, 255, 0.1)",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: "auto",
                      mr: isCollapsed ? 0 : 2,
                      color: "#fff",
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  {!isCollapsed && <ListItemText primary={item.name} />}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
      <Box sx={{ mt: "auto" }}>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ mb: 2 }}>
            <ListItemButton
              component={Link}
              to="/images"
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                justifyContent: isCollapsed ? "center" : "flex-start",
                px: 1,
                backgroundColor:
                  location.pathname === "/images" ? "#5a55d8" : "transparent",
                "&:hover": {
                  backgroundColor:
                    location.pathname === "/images"
                      ? "#5a55d8"
                      : "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  mr: isCollapsed ? 0 : 2,
                  color: "#fff",
                }}
              >
                <Upload />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="Images" />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mb: 2 }}>
            <ListItemButton
              component={Link}
              to="/audios"
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                justifyContent: isCollapsed ? "center" : "flex-start",
                px: 1,
                backgroundColor:
                  location.pathname === "/audios" ? "#5a55d8" : "transparent",
                "&:hover": {
                  backgroundColor:
                    location.pathname === "/audios"
                      ? "#5a55d8"
                      : "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  mr: isCollapsed ? 0 : 2,
                  color: "#fff",
                }}
              >
                <AudioLines />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="Audios" />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component="button"
              onClick={() => {
                logout();
                navigate('/login');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                justifyContent: isCollapsed ? "center" : "flex-start",
                px: 1,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: "auto",
                  mr: isCollapsed ? 0 : 2,
                  color: "#fff",
                }}
              >
                <LogOut />
              </ListItemIcon>
              {!isCollapsed && <ListItemText primary="Logout" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", backgroundColor: "#fff" }}>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: 240,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
