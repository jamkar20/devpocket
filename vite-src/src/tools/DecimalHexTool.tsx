import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";

import { ContentCopy, SwapHoriz, RestartAlt } from "@mui/icons-material";

type ConversionMode = "decimal-to-hex" | "hex-to-decimal";

export default function DecimalHexTool() {
  const [mode, setMode] = useState<ConversionMode>("decimal-to-hex");
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState(false);

  const isDecimalToHex = mode === "decimal-to-hex";

  const result = useMemo(() => {
    const value = input.trim();

    if (!value) {
      return { value: "", error: "" };
    }

    if (isDecimalToHex) {
      if (!/^[+-]?\d+$/.test(value)) {
        return {
          value: "",
          error: "Enter a valid decimal integer.",
        };
      }

      try {
        return {
          value: BigInt(value).toString(16).toUpperCase(),
          error: "",
        };
      } catch {
        return {
          value: "",
          error: "Unable to convert this value.",
        };
      }
    }

    if (!/^[+-]?(?:0x)?[0-9a-f]+$/i.test(value)) {
      return {
        value: "",
        error: "Enter a valid hexadecimal integer.",
      };
    }

    try {
      const negative = value.startsWith("-");
      const unsigned = value.replace(/^[+-]/, "");
      const digits = unsigned.replace(/^0x/i, "");
      const decimal = BigInt(`0x${digits}`);

      return {
        value: (negative ? -decimal : decimal).toString(10),
        error: "",
      };
    } catch {
      return {
        value: "",
        error: "Unable to convert this value.",
      };
    }
  }, [input, isDecimalToHex]);

  function changeMode(
    _event: React.MouseEvent<HTMLElement>,
    nextMode: ConversionMode | null,
  ) {
    if (!nextMode) return;

    setMode(nextMode);
    setInput("");
    setNotice(false);
  }

  function reset() {
    setInput("");
    setNotice(false);
  }

  async function copyResult() {
    if (!result.value) return;

    try {
      await navigator.clipboard.writeText(result.value);
      setNotice(true);
    } catch {
      setNotice(false);
    }
  }

  const examples = isDecimalToHex
    ? [
        ["10", "A"],
        ["255", "FF"],
        ["4096", "1000"],
        ["65535", "FFFF"],
      ]
    : [
        ["A", "10"],
        ["FF", "255"],
        ["1000", "4096"],
        ["FFFF", "65535"],
      ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          mb: 2.5,
          gap: 2,
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 650, fontSize: 14 }}>
            Number conversion
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Convert integers between base 10 and base 16.
          </Typography>
        </Box>

        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAlt />}
          onClick={reset}
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          Clear
        </Button>
      </Stack>

      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={mode}
        onChange={changeMode}
        aria-label="Conversion mode"
        sx={{
          mb: 3,
          "& .MuiToggleButton-root": {
            py: 1,
            textTransform: "none",
            fontWeight: 600,
          },
        }}
      >
        <ToggleButton value="decimal-to-hex">
          Decimal <SwapHoriz sx={{ mx: 1, fontSize: 17 }} /> Hex
        </ToggleButton>

        <ToggleButton value="hex-to-decimal">
          Hex <SwapHoriz sx={{ mx: 1, fontSize: 17 }} /> Decimal
        </ToggleButton>
      </ToggleButtonGroup>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            md: "minmax(0, 1fr) minmax(0, 1fr)",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box>
          <Typography
            component="label"
            htmlFor="number-input"
            sx={{ mb: 1, display: "block", fontSize: 12, fontWeight: 600 }}
          >
            {isDecimalToHex ? "Decimal input" : "Hexadecimal input"}
          </Typography>

          <TextField
            id="number-input"
            fullWidth
            size="small"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={isDecimalToHex ? "e.g. 255" : "e.g. FF or 0xFF"}
            error={Boolean(result.error)}
            autoComplete="off"
            slotProps={{
              htmlInput: {
                spellCheck: false,
                style: {
                  fontFamily: "Consolas, monospace",
                  direction: "ltr",
                  textAlign: "left",
                },
              },
            }}
          />

          <Typography
            variant="caption"
            color={result.error ? "error" : "text.secondary"}
            sx={{ display: "block", mt: 1, minHeight: 18 }}
          >
            {result.error ||
              (isDecimalToHex
                ? "Enter a positive or negative integer."
                : "Digits 0–9 and letters A–F are supported.")}
          </Typography>
        </Box>

        <Box>
          <Typography
            component="label"
            sx={{ mb: 1, display: "block", fontSize: 12, fontWeight: 600 }}
          >
            Result
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              minHeight: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              pl: 1.5,
              pr: 0.5,
              borderColor: "divider",
              bgcolor: "action.hover",
            }}
          >
            <Typography
              component="code"
              dir="ltr"
              sx={{
                minWidth: 0,
                overflowWrap: "anywhere",
                fontFamily: "Consolas, monospace",
                fontSize: 14,
                fontWeight: 650,
              }}
            >
              {result.value || "—"}
            </Typography>

            <Tooltip title="Copy result">
              <span>
                <IconButton
                  size="small"
                  disabled={!result.value}
                  onClick={copyResult}
                  aria-label="Copy result"
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Paper>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1, minHeight: 18 }}
          >
            {result.value
              ? "Conversion completed."
              : "The result will appear here."}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2.5 }} />

      <Typography sx={{ mb: 1.25, fontSize: 12, fontWeight: 650 }}>
        Quick examples
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(4, minmax(0, 1fr))",
          },
          gap: 1,
        }}
      >
        {examples.map(([sample, expected]) => (
          <Button
            key={sample}
            variant="outlined"
            color="inherit"
            onClick={() => setInput(sample)}
            sx={{
              minWidth: 0,
              justifyContent: "space-between",
              px: 1.25,
              borderColor: "divider",
              color: "text.secondary",
              fontFamily: "Consolas, monospace",
              fontSize: 12,
            }}
          >
            <span>{sample}</span>
            <SwapHoriz sx={{ fontSize: 15, mx: 0.5 }} />
            <span>{expected}</span>
          </Button>
        ))}
      </Box>

      <Snackbar
        open={notice}
        autoHideDuration={1800}
        onClose={() => setNotice(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotice(false)}
        >
          Result copied to clipboard.
        </Alert>
      </Snackbar>
    </Box>
  );
}
