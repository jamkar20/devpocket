import { useEffect, useMemo, useState } from "react";
import { Box, Typography, ThemeProvider, CssBaseline } from "@mui/material";

import Sidebar from "./components/Sidebar";
import ToolRenderer from "./components/ToolRenderer";

import { tools } from "./data/tools";
import { createAppTheme } from "./theme";
import { getDesktopInfo, type DesktopInfo } from "./services/desktop";
import "./i18n";
import { ToolFeedbackProvider } from "./components/tool-ui/ToolFeedbackProvider";
import Home from "./tools/Home";

type ThemeMode = "dark" | "light";
type Language = "en" | "fa";

const THEME_STORAGE_KEY = "devpocket-theme";

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);

    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // Use the default theme when storage is unavailable.
  }

  return "dark";
}

export default function App() {
  const [activeTool, setActiveTool] = useState("home");
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);
  const [language, setLanguage] = useState<Language>("en");
  const [desktopInfo, setDesktopInfo] = useState<DesktopInfo>();

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const selectedTool = tools.find((tool) => tool.id === activeTool);

  useEffect(() => {
    getDesktopInfo()
      .then(setDesktopInfo)
      .catch((error) => {
        console.error("Failed to get desktop info:", error);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Theme remains available for this session.
    }
  }, [mode]);

  const toggleTheme = () => {
    setMode((current) => (current === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <ToolFeedbackProvider>
        <Box
          className="app-shell"
          sx={{
            display: "flex",
            width: "100%",
            height: "100dvh",
            overflow: "hidden",
            bgcolor: "background.default",
            color: "text.primary",
          }}
        >
          <Sidebar
            activeTool={activeTool}
            onSelectTool={setActiveTool}
            mode={mode}
            onToggleTheme={toggleTheme}
            language={language}
            onChangeLanguage={setLanguage}
            desktopInfo={desktopInfo}
          />

          <Box
            component="main"
            className="main-content"
            sx={{
              flex: 1,
              minWidth: 0,
              height: "100%",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Scrollable content */}
            <Box
              className="content-area"
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 1200,
                  mx: "auto",
                  px: { xs: 2, md: 3 },
                  py: { xs: 2, md: 2.5 },
                  boxSizing: "border-box",
                }}
              >
                {/* Page header */}
                <Box
                  component="header"
                  sx={{
                    mb: 2,
                    pb: 1.5,
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    component="h1"
                    variant="h1"
                    sx={{
                      mb: 0.5,
                      lineHeight: 1.3,
                    }}
                  >
                    {activeTool === "home"
                      ? "Home"
                      : (selectedTool?.name ?? "Developer Tools")}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6, maxWidth: 680 }}
                  >
                    {activeTool === "home"
                      ? "Browse your developer tools by category."
                      : (selectedTool?.description ??
                        "Small tools for everyday development tasks.")}
                  </Typography>
                </Box>

                {/* Tool content: no duplicate title or outer card */}
                <Box
                  className="workspace-panel"
                  sx={{
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  {activeTool === "home" ? (
                    <Home onSelectTool={setActiveTool} />
                  ) : (
                    <ToolRenderer toolId={activeTool} />
                  )}
                </Box>
              </Box>
            </Box>

            {/* Fixed footer */}
            <Box
              component="footer"
              sx={{
                flexShrink: 0,
                px: { xs: 2, md: 3 },
                py: 1,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.default",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  maxWidth: 1200,
                  mx: "auto",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  DevPocket · Built with ❤️ for developers
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </ToolFeedbackProvider>
    </ThemeProvider>
  );
}
