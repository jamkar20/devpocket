import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ContentCopy, RestartAlt } from "@mui/icons-material";

type DecodeFormat = "base64" | "base64url" | "utf8" | "hex";

function decodeBase64(input: string, urlSafe: boolean): Uint8Array {
  let value = input.trim();

  if (!value) return new Uint8Array();

  if (urlSafe) {
    if (!/^[A-Za-z0-9_-]*={0,2}$/.test(value)) {
      throw new Error("Invalid Base64URL characters.");
    }

    value = value.replace(/-/g, "+").replace(/_/g, "/");
  } else if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
    throw new Error("Invalid Base64 characters.");
  }

  if (value.length % 4 === 1) {
    throw new Error("Invalid Base64 length.");
  }

  const unpadded = value.replace(/=+$/, "");

  if (value.includes("=") && value.length % 4 !== 0) {
    throw new Error("Invalid Base64 padding.");
  }

  const normalized = unpadded.padEnd(
    unpadded.length + ((4 - (unpadded.length % 4)) % 4),
    "=",
  );

  let binary: string;

  try {
    binary = atob(normalized);
  } catch {
    throw new Error("Unable to decode Base64 input.");
  }

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  // Reject non-canonical encodings and malformed padding.
  const canonical = btoa(binary).replace(/=+$/, "");
  if (canonical !== unpadded) {
    throw new Error("Invalid Base64 encoding or padding.");
  }

  return bytes;
}

function decodeHex(input: string): Uint8Array {
  const value = input.trim().replace(/\s+/g, "").replace(/^0x/i, "");

  if (!value) return new Uint8Array();

  if (!/^(?:[0-9a-fA-F]{2})+$/.test(value)) {
    throw new Error("Hex must contain complete byte pairs (0–9, A–F).");
  }

  const bytes = new Uint8Array(value.length / 2);

  for (let i = 0; i < value.length; i += 2) {
    bytes[i / 2] = Number.parseInt(value.slice(i, i + 2), 16);
  }

  return bytes;
}

function decodeInput(input: string, format: DecodeFormat): Uint8Array {
  switch (format) {
    case "base64":
      return decodeBase64(input, false);

    case "base64url":
      return decodeBase64(input, true);

    case "hex":
      return decodeHex(input);

    case "utf8":
      return new TextEncoder().encode(input);
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0").toUpperCase(),
  ).join(" ");
}

function bytesToBase64(bytes: Uint8Array, urlSafe = false): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  const base64 = btoa(binary);

  return urlSafe
    ? base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
    : base64;
}

export default function DecodeTool() {
  const [format, setFormat] = useState<DecodeFormat>("base64");
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState(false);

  const result = useMemo(() => {
    if (!input) {
      return {
        text: "",
        hex: "",
        base64: "",
        base64url: "",
        error: "",
      };
    }

    try {
      const bytes = decodeInput(input, format);

      let text: string;

      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      } catch {
        text = "";
      }

      return {
        text,
        hex: bytesToHex(bytes),
        base64: bytesToBase64(bytes),
        base64url: bytesToBase64(bytes, true),
        error: "",
      };
    } catch (error) {
      return {
        text: "",
        hex: "",
        base64: "",
        base64url: "",
        error:
          error instanceof Error ? error.message : "Unable to decode input.",
      };
    }
  }, [input, format]);

  async function copyValue(value: string) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setNotice(true);
    } catch {
      setNotice(false);
    }
  }

  function clear() {
    setInput("");
    setNotice(false);
  }

  const outputs = [
    {
      label: "UTF-8 Text",
      value: result.text,
      placeholder: "No valid UTF-8 text",
    },
    {
      label: "Hexadecimal",
      value: result.hex,
      placeholder: "Decoded bytes will appear here",
    },
    {
      label: "Base64",
      value: result.base64,
      placeholder: "—",
    },
    {
      label: "Base64URL",
      value: result.base64url,
      placeholder: "—",
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack
        direction="row"
        sx={{
          mb: 2.5,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 650 }}>Decode</Typography>
          <Typography variant="caption" color="text.secondary">
            Base64 · Base64URL · UTF-8 · Hex
          </Typography>
        </Box>

        <Tooltip title="Clear all">
          <IconButton onClick={clear} size="small" aria-label="Clear all">
            <RestartAlt fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Typography
        component="label"
        htmlFor="decode-format"
        sx={{
          display: "block",
          mb: 0.75,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Input format
      </Typography>

      <TextField
        id="decode-format"
        select
        fullWidth
        size="small"
        value={format}
        onChange={(event) => setFormat(event.target.value as DecodeFormat)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="base64">Base64</MenuItem>
        <MenuItem value="base64url">Base64URL</MenuItem>
        <MenuItem value="hex">Hexadecimal</MenuItem>
        <MenuItem value="utf8">UTF-8 Text</MenuItem>
      </TextField>

      <TextField
        fullWidth
        multiline
        minRows={3}
        maxRows={8}
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={
          format === "base64"
            ? "Paste Base64 data..."
            : format === "base64url"
              ? "Paste Base64URL data..."
              : format === "hex"
                ? "Paste hex bytes, e.g. 48 65 6C 6C 6F"
                : "Enter UTF-8 text..."
        }
        error={Boolean(result.error)}
        slotProps={{
          htmlInput: {
            spellCheck: false,
            style: {
              fontFamily: "Consolas, monospace",
              direction: "ltr",
              textAlign: "left",
              overflowWrap: "anywhere",
            },
          },
        }}
      />

      {result.error && (
        <Alert severity="error" sx={{ mt: 1.5 }}>
          {result.error}
        </Alert>
      )}

      <Typography sx={{ mt: 2.5, mb: 1.25, fontSize: 12, fontWeight: 650 }}>
        Output
      </Typography>

      <Stack spacing={1.25}>
        {outputs.map((output) => (
          <Box key={output.label}>
            <Stack
              direction="row"
              sx={{
                mb: 0.5,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                sx={{ fontSize: 12, fontWeight: 600 }}
                color="text.secondary"
              >
                {output.label}
              </Typography>

              <Tooltip title={`Copy ${output.label}`}>
                <span>
                  <IconButton
                    size="small"
                    disabled={!output.value || Boolean(result.error)}
                    onClick={() => copyValue(output.value)}
                    aria-label={`Copy ${output.label}`}
                  >
                    <ContentCopy sx={{ fontSize: 15 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                minHeight: 42,
                p: 1.25,
                bgcolor: "action.hover",
              }}
            >
              <Typography
                component="pre"
                dir="ltr"
                sx={{
                  m: 0,
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  fontFamily: "Consolas, monospace",
                  fontSize: 13,
                  color: output.value ? "text.primary" : "text.disabled",
                }}
              >
                {output.value || output.placeholder}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Snackbar
        open={notice}
        autoHideDuration={1600}
        onClose={() => setNotice(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setNotice(false)}
        >
          Copied to clipboard.
        </Alert>
      </Snackbar>
    </Box>
  );
}
