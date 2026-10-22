import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Divider,
  ThemeProvider,
  CssBaseline,
  Paper,
} from "@mui/material";

import Sidebar from "./components/Sidebar";
import { tools } from "./data/tools";
import { createAppTheme } from "./theme";
import DecimalHexTool from "./tools/DecimalHexTool";

type ThemeMode = "dark" | "light";

function getInitialTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem("devpocket-theme");

    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // Fall back to dark mode.
  }

  return "dark";
}

export default function App() {
  const [activeTool, setActiveTool] = useState("decimal-hex");
  const [mode, setMode] = useState<ThemeMode>(getInitialTheme);

  const theme = useMemo(() => createAppTheme(mode), [mode]);
  const selectedTool = tools.find((tool) => tool.id === activeTool);

  useEffect(() => {
    try {
      localStorage.setItem("devpocket-theme", mode);
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

      <Box
        className="app-shell"
        sx={{
          display: "flex",
          width: "100%",
          height: "100dvh",
          minWidth: 800,
          minHeight: 500,
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
        />

        <Box
          component="main"
          className="main-content"
          sx={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            overflow: "auto",
          }}
        >
          <Box
            className="content-area"
            sx={{
              width: "100%",
              maxWidth: 1200,
              mx: "auto",
              px: { xs: 2.5, md: 4 },
              py: { xs: 3, md: 4 },
            }}
          >
            <Box sx={{ mb: 3.5 }}>
              <Typography component="h1" variant="h1" sx={{ mb: 1 }}>
                {selectedTool?.name ?? "Developer Tools"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.8, maxWidth: 680 }}
              >
                {selectedTool?.description ??
                  "Small tools for everyday development tasks."}
              </Typography>
            </Box>

            <Paper
              className="workspace-panel"
              variant="outlined"
              sx={{
                overflow: "hidden",
                borderColor: "divider",
                bgcolor: "background.paper",
                borderRadius: 4,
              }}
            >
              <Box
                sx={{
                  minHeight: 52,
                  px: 2.5,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                  {selectedTool?.name ?? "Workspace"}
                </Typography>
              </Box>

              {activeTool === "decimal-hex" ? (
                <DecimalHexTool />
              ) : (
                <Box
                  sx={{
                    minHeight: 280,
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="h3">Coming soon</Typography>

                  <Typography variant="body2" color="text.secondary">
                    This tool will be implemented in a future update.
                  </Typography>
                </Box>
              )}
            </Paper>

            <Divider sx={{ mt: 4, mb: 2, opacity: 0.6 }} />

            <Typography variant="caption" color="text.secondary">
              DevPocket · Built for developers
            </Typography>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
