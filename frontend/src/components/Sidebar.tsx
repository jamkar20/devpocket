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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  Stack,
  MenuItem,
} from "@mui/material";

import {
  Search,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Terminal,
  Settings,
  DarkMode,
  LightMode,
  Close,
  Language,
  Palette,
} from "@mui/icons-material";

import { categories, tools, type ToolId } from "../data/tools";
import { DesktopInfo } from "../services/desktop";

type ThemeMode = "dark" | "light";
type AppLanguage = "en" | "fa";

interface SidebarProps {
  activeTool: string;
  onSelectTool: (toolId: string) => void;
  mode: ThemeMode;
  onToggleTheme: () => void;
  language: AppLanguage;
  onChangeLanguage: (language: AppLanguage) => void;
  desktopInfo?: DesktopInfo;
}

export default function Sidebar({
  activeTool,
  onSelectTool,
  mode,
  onToggleTheme,
  language,
  onChangeLanguage,
  desktopInfo,
}: SidebarProps) {
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([
    "converters",
    "formatters",
  ]);

  const filteredTools = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return tools;

    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return tools;
    }

    return tools.filter((tool) => {
      const category = categories.find((item) => item.id === tool.category);

      const searchableText = [
        tool.name,
        tool.description,
        tool.id,
        tool.category,
        category?.name ?? "",
        ...tool.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [search]);

  function toggleCategory(categoryId: string) {
    setExpanded((current) =>
      current.includes(categoryId)
        ? current.filter((id) => id !== categoryId)
        : [...current, categoryId],
    );
  }

  function handleModeChange(nextMode: ThemeMode) {
    if (nextMode !== mode) {
      onToggleTheme();
    }
  }

  return (
    <>
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
                    <Search sx={{ fontSize: 18, color: "text.secondary" }} />
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

        {/* Tools heading */}
        <Box sx={{ px: 2, pt: 1.75, pb: 0.75 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 0.8 }}
          >
            TOOLBOX
          </Typography>
        </Box>

        {/* Tools list */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            px: 1,
            pb: 1,
          }}
        >
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

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ pr: 1 }}
                  >
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
                                color: selected ? "inherit" : "text.secondary",
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

        <Divider />

        {/* Settings trigger */}
        <Box sx={{ p: 1.25 }}>
          <ListItemButton
            onClick={() => setSettingsOpen(true)}
            sx={{
              px: 1.25,
              py: 0,
              borderRadius: 2.5,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: "text.secondary" }}>
              <Settings fontSize="small" />
            </ListItemIcon>

            <ListItemText
              primary="Settings"
              secondary="Appearance & language"
              slotProps={{
                primary: { sx: { fontSize: 12.5, fontWeight: 600 } },
                secondary: { sx: { fontSize: 11 } },
              }}
            />

            <KeyboardArrowRight
              sx={{ fontSize: 18, color: "text.secondary" }}
            />
          </ListItemButton>
        </Box>

        {/* App information */}
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
            {desktopInfo?.name}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            v{desktopInfo?.version ?? "0.0.0"}
          </Typography>
        </Box>
      </Box>

      {/* Settings dialog */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: { borderRadius: 3 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Settings color="action" />
              </Box>

              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Settings
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Customize your DevPocket experience
                </Typography>
              </Box>
            </Box>

            <IconButton
              size="small"
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: "12px !important" }}>
          <Stack spacing={2.5}>
            {/* Appearance */}
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1.25, alignItems: "center" }}
              >
                <Palette fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                  Appearance
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  fullWidth
                  variant={mode === "light" ? "contained" : "outlined"}
                  color={mode === "light" ? "primary" : "inherit"}
                  startIcon={<LightMode fontSize="small" />}
                  onClick={() => handleModeChange("light")}
                  sx={{ py: 1, borderRadius: 2 }}
                >
                  Light
                </Button>

                <Button
                  fullWidth
                  variant={mode === "dark" ? "contained" : "outlined"}
                  color={mode === "dark" ? "primary" : "inherit"}
                  startIcon={<DarkMode fontSize="small" />}
                  onClick={() => handleModeChange("dark")}
                  sx={{ py: 1, borderRadius: 2 }}
                >
                  Dark
                </Button>
              </Stack>
            </Box>

            <Divider />

            {/* Language */}
            <Box>
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1.25, alignItems: "center" }}
              >
                <Language fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                  Language
                </Typography>
              </Stack>

              <FormControl fullWidth size="small">
                <InputLabel id="settings-language-label">
                  Interface language
                </InputLabel>

                <Select
                  labelId="settings-language-label"
                  value={language}
                  label="Interface language"
                  onChange={(event) =>
                    onChangeLanguage(event.target.value as AppLanguage)
                  }
                >
                  <MenuItem value="en">
                    <Box>
                      <Typography variant="body2">English</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Left to right (LTR)
                      </Typography>
                    </Box>
                  </MenuItem>

                  <MenuItem value="fa">
                    <Box>
                      <Typography variant="body2">فارسی</Typography>
                      <Typography variant="caption" color="text.secondary">
                        راست‌چین (RTL)
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setSettingsOpen(false)}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
