import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";

import ToolLayout from "../components/tool-ui/ToolLayout";
import ToolField from "../components/tool-ui/ToolField";
import { useToolFeedback } from "../components/tool-ui/ToolFeedbackProvider";

type OtpMode = "totp" | "hotp";
type HmacAlgorithm = "SHA-1" | "SHA-256" | "SHA-512";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function encodeBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

function decodeBase32(secret: string): Uint8Array {
  const normalized = secret.toUpperCase().replace(/[\s=-]/g, "");

  if (!normalized || !/^[A-Z2-7]+$/.test(normalized)) {
    throw new Error("Secret must be a valid Base32 string.");
  }

  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (const char of normalized) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

function generateSecret(): string {
  return encodeBase32(crypto.getRandomValues(new Uint8Array(20)));
}

async function calculateOtp(
  secret: string,
  counter: bigint,
  digits: number,
  algorithm: HmacAlgorithm,
): Promise<string> {
  const secretBytes = decodeBase32(secret);

  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes as any,
    {
      name: "HMAC",
      hash: { name: algorithm },
    },
    false,
    ["sign"],
  );

  const message = new Uint8Array(8);
  let value = counter;

  for (let i = 7; i >= 0; i--) {
    message[i] = Number(value & 0xffn);
    value >>= 8n;
  }

  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, message),
  );

  const offset = signature[signature.length - 1] & 0x0f;

  const binary =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, "0");
}

export default function OtpGenerator() {
  const { copy, notify } = useToolFeedback();

  const [mode, setMode] = useState<OtpMode>("totp");
  const [secret, setSecret] = useState(() => generateSecret());
  const [digits, setDigits] = useState(6);
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>("SHA-1");
  const [period, setPeriod] = useState(30);
  const [counter, setCounter] = useState("0");

  const [otp, setOtp] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mode !== "totp") return;

    let cancelled = false;

    async function updateTotp() {
      try {
        const timeCounter = BigInt(Math.floor(now / 1000 / period));

        const result = await calculateOtp(
          secret,
          timeCounter,
          digits,
          algorithm,
        );

        if (!cancelled) {
          setOtp(result);
          setError("");
        }
      } catch (reason) {
        if (!cancelled) {
          setOtp("");
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to generate TOTP.",
          );
        }
      }
    }

    void updateTotp();

    return () => {
      cancelled = true;
    };
  }, [mode, secret, digits, algorithm, period, now]);

  const secondsRemaining = period - (Math.floor(now / 1000) % period);

  const regenerateSecret = useCallback(() => {
    setSecret(generateSecret());
    setOtp("");
    setError("");
  }, []);

  const reset = useCallback(() => {
    setMode("totp");
    setSecret(generateSecret());
    setDigits(6);
    setAlgorithm("SHA-1");
    setPeriod(30);
    setCounter("0");
    setOtp("");
    setError("");
    setNow(Date.now());
  }, []);

  async function generateHotp() {
    try {
      setError("");

      if (!/^\d+$/.test(counter)) {
        throw new Error("Counter must be a non-negative integer.");
      }

      const currentCounter = BigInt(counter);

      const result = await calculateOtp(
        secret,
        currentCounter,
        digits,
        algorithm,
      );

      setOtp(result);
      setCounter((currentCounter + 1n).toString());

      notify("HOTP generated successfully.", "success");
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Unable to generate HOTP.";

      setOtp("");
      setError(message);
      notify(message, "error");
    }
  }

  async function refreshTotp() {
    setNow(Date.now());
  }

  return (
    <ToolLayout onReset={reset} resetLabel="Reset OTP settings">
      <Stack spacing={1}>
        {/* Secret */}
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Stack spacing={0.75}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Secret
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "minmax(0, 1fr) auto",
                },
                gap: 1,
                alignItems: "start",
              }}
            >
              <ToolField
                label="Base32 Secret"
                value={secret}
                onChange={(value) => {
                  setSecret(value.toUpperCase());
                  setOtp("");
                  setError("");
                }}
                placeholder="Enter Base32 secret"
              />

              <Button
                variant="outlined"
                size="small"
                startIcon={<AutorenewRoundedIcon />}
                onClick={regenerateSecret}
                sx={{ minHeight: 40, whiteSpace: "nowrap" }}
              >
                Generate
              </Button>
            </Box>

            <Typography variant="caption" color="text.secondary">
              Keep the secret private. Use the same secret in your
              authenticator.
            </Typography>
          </Stack>
        </Paper>

        {/* Configuration */}
        <Paper variant="outlined" sx={{ p: 1.25 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Configuration
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1,
              alignItems: "start",
            }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Mode"
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as OtpMode);
                setOtp("");
                setError("");
              }}
            >
              <MenuItem value="totp">TOTP</MenuItem>
              <MenuItem value="hotp">HOTP</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Digits"
              value={digits}
              onChange={(event) => {
                setDigits(Number(event.target.value));
                setOtp("");
              }}
            >
              <MenuItem value={6}>6 digits</MenuItem>
              <MenuItem value={8}>8 digits</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Algorithm"
              value={algorithm}
              onChange={(event) => {
                setAlgorithm(event.target.value as HmacAlgorithm);
                setOtp("");
              }}
            >
              <MenuItem value="SHA-1">SHA-1</MenuItem>
              <MenuItem value="SHA-256">SHA-256</MenuItem>
              <MenuItem value="SHA-512">SHA-512</MenuItem>
            </TextField>

            {mode === "totp" ? (
              <TextField
                select
                fullWidth
                size="small"
                label="Time step"
                value={period}
                onChange={(event) => {
                  setPeriod(Number(event.target.value));
                  setOtp("");
                }}
              >
                <MenuItem value={30}>30 seconds</MenuItem>
                <MenuItem value={60}>60 seconds</MenuItem>
              </TextField>
            ) : (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Counter"
                value={counter}
                onChange={(event) => {
                  const value = event.target.value;

                  if (/^\d*$/.test(value)) {
                    setCounter(value);
                    setOtp("");
                    setError("");
                  }
                }}
                slotProps={{
                  htmlInput: { min: 0, step: 1 },
                }}
              />
            )}
          </Box>

          {mode === "hotp" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.75 }}
            >
              Counter advances after successful generation.
            </Typography>
          )}
        </Paper>

        {/* Errors */}
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            onClose={() => setError("")}
            sx={{ py: 0, "& .MuiAlert-message": { py: 0.75 } }}
          >
            {error}
          </Alert>
        )}

        {/* Generated OTP */}
        <Paper variant="outlined" sx={{ p: 1.5 }}>
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              sx={{ alignItems: "center", justifyContent: "space-between" }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                <SecurityRoundedIcon fontSize="small" color="action" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Generated OTP
                </Typography>
              </Stack>

              <Chip
                size="small"
                label={mode.toUpperCase()}
                color={mode === "totp" ? "primary" : "default"}
                variant="outlined"
              />
            </Stack>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                flexWrap: "wrap",
                py: 0.5,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: { xs: 4, sm: 6 },
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.3,
                }}
              >
                {otp || "—".repeat(digits)}
              </Typography>

              {mode === "totp" && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: "center" }}
                  color="text.secondary"
                >
                  <TimerOutlinedIcon fontSize="small" />
                  <Typography variant="body2" sx={{ whiteSpace: "nowrap" }}>
                    {secondsRemaining}s remaining
                  </Typography>
                </Stack>
              )}
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyRoundedIcon />}
                disabled={!otp}
                onClick={() => void copy(otp, "OTP")}
              >
                Copy OTP
              </Button>

              {mode === "hotp" ? (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => void generateHotp()}
                >
                  Generate next OTP
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<RefreshRoundedIcon />}
                  onClick={() => void refreshTotp()}
                >
                  Refresh OTP
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </ToolLayout>
  );
}
