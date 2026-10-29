import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { ArrowForwardIosRounded } from "@mui/icons-material";

import { categories, tools, type ToolId } from "../data/tools";

interface HomeProps {
  onSelectTool: (toolId: ToolId) => void;
}

export default function Home({ onSelectTool }: HomeProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {categories.map((category, index) => {
        const categoryTools = tools.filter(
          (tool) => tool.category === category.id,
        );

        if (categoryTools.length === 0) return null;

        return (
          <Box key={category.id}>
            {/* Category header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0.5,
                px: 0.5,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, fontSize: 13 }}
              >
                {category.name}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: 11 }}
              >
                {categoryTools.length}
              </Typography>
            </Box>

            {/* Compact wrapping tool grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(auto-fill, minmax(220px, 1fr))",
                },
                gap: 0.75,
              }}
            >
              {categoryTools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <Box
                    key={tool.id}
                    onClick={() => onSelectTool(tool.id as ToolId)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                      minHeight: 44,
                      px: 1,
                      py: 0.75,
                      borderRadius: 1.5,
                      cursor: "pointer",
                      border: "1px solid transparent",
                      "&:hover": {
                        bgcolor: "action.hover",
                        borderColor: "divider",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        color: "text.secondary",
                      }}
                    >
                      <Icon sx={{ fontSize: 19 }} />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{ fontSize: 12.5, fontWeight: 600 }}
                        noWrap
                      >
                        {tool.name}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: 10.5 }}
                        noWrap
                      >
                        {tool.description}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            {index < categories.length - 1 && <Divider sx={{ mt: 1.25 }} />}
          </Box>
        );
      })}
    </Box>
  );
}
