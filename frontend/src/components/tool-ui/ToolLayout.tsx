import type { ReactNode } from "react";
import { Box, IconButton, Stack, Tooltip } from "@mui/material";
import { RestartAlt } from "@mui/icons-material";

interface ToolLayoutProps {
  children: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  actions?: ReactNode;
}

export default function ToolLayout({
  children,
  onReset,
  resetLabel = "Reset",
  actions,
}: ToolLayoutProps) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        minWidth: 0,
      }}
    >
      {(onReset || actions) && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, alignItems: "center", justifyContent: "flex-end" }}
        >
          {actions}

          {onReset && (
            <Tooltip title={resetLabel}>
              <IconButton
                size="small"
                onClick={onReset}
                aria-label={resetLabel}
              >
                <RestartAlt fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}

      {children}
    </Box>
  );
}
