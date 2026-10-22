
import { useMemo, useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  IconButton,
} from "@mui/material";

import {
  Search,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Terminal,
  Settings,
  DarkMode,
  LightMode,
} from "@mui/icons-material";

import { categories, tools, type ToolId } from "../data/tools";

type ThemeMode = "dark" | "light";

interface SidebarProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
  mode: ThemeMode;
  onToggleTheme: () => void;
}

export default function Sidebar({
  activeTool,
  onSelectTool,
  mode,
  onToggleTheme,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>([
    "converters",
    "formatters",
  ]);

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tools;

    return tools.filter(
      (tool) =>
        tool.name.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query),
    );
  }, [search]);

  function toggleCategory(categoryId: string) {
    setExpanded((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  return (
    <Box
      component="aside"
      sx={{
        width: 250,
        minWidth: 250,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      {/* Brand */}
      <Box sx={{ px: 2.25, pt: 2.25, pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              flexShrink: 0,
            }}
          >
            <Terminal fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ fontWeight: 750, lineHeight: 1.4, fontSize: 16 }}
            >
              DevPocket
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Developer toolkit
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ px: 1.5, pb: 1.75 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search tools..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search
                    sx={{ fontSize: 18, color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              bgcolor: "action.hover",
              "& fieldset": { borderColor: "transparent" },
              "&:hover fieldset": { borderColor: "divider" },
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
        />
      </Box>

      <Divider />

      {/* Tools */}
      <Box sx={{ px: 2, pt: 1.75, pb: 0.75 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: 0.8 }}
        >
          TOOLBOX
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1, pb: 1 }}>
        {categories.map((category) => {
          const categoryTools = filteredTools.filter(
            (tool) => tool.category === category.id,
          );

          if (categoryTools.length === 0) return null;

          const isExpanded =
            search.trim().length > 0 || expanded.includes(category.id);

          return (
            <Box key={category.id} sx={{ mb: 0.75 }}>
              <ListItemButton
                onClick={() => toggleCategory(category.id)}
                sx={{
                  minHeight: 34,
                  px: 1.25,
                  borderRadius: 2,
                  color: "text.secondary",
                }}
              >
                {isExpanded ? (
                  <KeyboardArrowDown sx={{ fontSize: 17, mr: 0.75 }} />
                ) : (
                  <KeyboardArrowRight sx={{ fontSize: 17, mr: 0.75 }} />
                )}

                <ListItemText
                  primary={category.name}
                  slotProps={{
                    primary: {
                      sx: { fontSize: 12, fontWeight: 650 },
                    },
                  }}
                />

                <Typography variant="caption" color="text.secondary">
                  {categoryTools.length}
                </Typography>
              </ListItemButton>

              {isExpanded && (
                <List dense disablePadding sx={{ mt: 0.5 }}>
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon;
                    const selected = activeTool === tool.id;

                    return (
                      <Tooltip
                        key={tool.id}
                        title={tool.description}
                        placement="right"
                        enterDelay={700}
                      >
                        <ListItemButton
                          selected={selected}
                          onClick={() => onSelectTool(tool.id as ToolId)}
                          sx={{
                            minHeight: 38,
                            pl: 2,
                            pr: 1.25,
                            mb: 0.25,
                            borderRadius: 2.5,
                            "&.Mui-selected": {
                              bgcolor: "primary.main",
                              color: "primary.contrastText",
                            },
                            "&.Mui-selected:hover": {
                              bgcolor: "primary.main",
                              filter: "brightness(1.05)",
                            },
                            "&.Mui-selected .MuiListItemIcon-root": {
                              color: "inherit",
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 30,
                              color: selected
                                ? "inherit"
                                : "text.secondary",
                            }}
                          >
                            <Icon sx={{ fontSize: 17 }} />
                          </ListItemIcon>

                          <ListItemText
                            primary={tool.name}
                            slotProps={{
                              primary: {
                                sx: {
                                  fontSize: 12.5,
                                  fontWeight: selected ? 650 : 450,
                                },
                                noWrap: true,
                              },
                            }}
                          />
                        </ListItemButton>
                      </Tooltip>
                    );
                  })}
                </List>
              )}
            </Box>
          );
        })}

        {filteredTools.length === 0 && (
          <Typography
            color="text.secondary"
            variant="body2"
            sx={{ px: 1.5, py: 2 }}
          >
            No tools found.
          </Typography>
        )}
      </Box>

      {/* Sidebar settings */}
      <Divider />

      <Box sx={{ p: 1.25 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 0.5,
            borderRadius: 2.5,
            transition: "background-color 150ms ease",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <Settings
            sx={{ fontSize: 19, color: "text.secondary" }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
              Settings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Appearance
            </Typography>
          </Box>

          <Tooltip
            title={mode === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            <IconButton
              size="small"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              sx={{
                width: 34,
                height: 34,
                color: "text.secondary",
                borderRadius: 2.5,
              }}
            >
              {mode === "dark" ? (
                <LightMode fontSize="small" />
              ) : (
                <DarkMode fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Box
        sx={{
          px: 2.25,
          pb: 1.5,
          pt: 0.25,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Local utilities
        </Typography>
        <Typography variant="caption" color="text.secondary">
          v0.1.0
        </Typography>
      </Box>
    </Box>
  );
}
