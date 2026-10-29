import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";

import {
  createMD5,
  createSHA1,
  createSHA256,
  createSHA384,
  createSHA512,
} from "hash-wasm";

import type { IHasher } from "hash-wasm";

import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import ToolLayout from "../components/tool-ui/ToolLayout";

type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
type InputMode = "text" | "file";

const ALGORITHMS: HashAlgorithm[] = [
  "MD5",
  "SHA-1",
  "SHA-256",
  "SHA-384",
  "SHA-512",
];

function createHasher(algorithm: HashAlgorithm): Promise<IHasher> {
  switch (algorithm) {
    case "MD5":
      return createMD5();
    case "SHA-1":
      return createSHA1();
    case "SHA-256":
      return createSHA256();
    case "SHA-384":
      return createSHA384();
    case "SHA-512":
      return createSHA512();
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function HashTool() {
  const [mode, setMode] = useState<InputMode>("text");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleModeChange(nextMode: InputMode) {
    setMode(nextMode);
    setHash("");
    setError(null);
    setProgress(0);
    setCopied(false);
  }

  function handleAlgorithmChange(nextAlgorithm: HashAlgorithm) {
    setAlgorithm(nextAlgorithm);
    setHash("");
    setError(null);
    setCopied(false);
  }

  function handleFileChange(selectedFile?: File) {
    setFile(selectedFile ?? null);
    setHash("");
    setError(null);
    setProgress(0);
    setCopied(false);
  }

  async function handleGenerate() {
    setError(null);
    setHash("");
    setCopied(false);
    setProgress(0);

    if (mode === "file" && !file) {
      setError("Please select a file first.");
      return;
    }

    setLoading(true);

    try {
      const hasher = await createHasher(algorithm);
      await hasher.init();

      if (mode === "text") {
        hasher.update(new TextEncoder().encode(text));
        setHash(hasher.digest("hex"));
        setProgress(100);
        return;
      }

      if (!file) return;

      const reader = file.stream().getReader();
      let bytesProcessed = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          hasher.update(value);
          bytesProcessed += value.length;

          setProgress(
            file.size > 0
              ? Math.min(99, Math.floor((bytesProcessed / file.size) * 100))
              : 0,
          );
        }
      } finally {
        reader.releaseLock();
      }

      setHash(hasher.digest("hex"));
      setProgress(100);
    } catch (err) {
      console.error("Hash generation failed:", err);
      setError("Failed to generate the hash. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!hash) return;

    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
    } catch {
      setError("Could not copy the hash to the clipboard.");
    }
  }

  function handleReset() {
    setText("");
    setFile(null);
    setHash("");
    setError(null);
    setProgress(0);
    setCopied(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <ToolLayout
      onReset={handleReset}
      actions={
        <Button
          size="small"
          startIcon={<ClearRoundedIcon />}
          onClick={handleReset}
          disabled={!text && !file && !hash && !error}
        >
          Clear
        </Button>
      }
    >
      <Stack spacing={2}>
        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        {/* Algorithm */}
        <TextField
          select
          size="small"
          label="Hash algorithm"
          value={algorithm}
          onChange={(event) =>
            handleAlgorithmChange(event.target.value as HashAlgorithm)
          }
          fullWidth
        >
          {ALGORITHMS.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </TextField>

        {/* Input mode */}
        <Box>
          <Tabs
            value={mode}
            onChange={(_, value: InputMode) => handleModeChange(value)}
            sx={{
              minHeight: 38,
              "& .MuiTab-root": {
                minHeight: 38,
                textTransform: "none",
                fontSize: 13,
              },
            }}
          >
            <Tab value="text" label="Text" />
            <Tab value="file" label="File" />
          </Tabs>
        </Box>

        {/* Text input */}
        {mode === "text" && (
          <TextField
            label="Input text"
            placeholder="Enter text to hash..."
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setHash("");
              setError(null);
              setCopied(false);
              setProgress(0);
            }}
            multiline
            minRows={4}
            maxRows={10}
            fullWidth
            slotProps={{
              htmlInput: {
                spellCheck: false,
              },
            }}
          />
        )}

        {/* File input */}
        {mode === "file" && (
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <InsertDriveFileOutlinedIcon
              sx={{ fontSize: 28, color: "text.secondary" }}
            />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, overflowWrap: "anywhere" }}
              >
                {file?.name ?? "No file selected"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {file
                  ? formatFileSize(file.size)
                  : "Select a file to calculate its hash"}
              </Typography>
            </Box>

            <Button
              size="small"
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Browse
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
          </Box>
        )}

        {/* Generate */}
        <Button
          variant="contained"
          startIcon={<CalculateRoundedIcon />}
          onClick={handleGenerate}
          disabled={loading || (mode === "file" && !file)}
          sx={{ alignSelf: "flex-start" }}
        >
          Generate Hash
        </Button>

        {/* Progress */}
        {loading && mode === "file" && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ borderRadius: 1, height: 5, mb: 0.75 }}
            />

            <Typography variant="caption" color="text.secondary">
              Processing file... {progress}%
            </Typography>
          </Box>
        )}

        {/* Result */}
        {hash && (
          <Stack spacing={1}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 650 }}>
                Hash Result
              </Typography>

              <Button
                size="small"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </Box>

            <TextField
              value={hash}
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              slotProps={{
                input: {
                  readOnly: true,
                  sx: {
                    fontFamily: "monospace",
                    fontSize: 12,
                    overflowWrap: "anywhere",
                    wordBreak: "break-all",
                  },
                },
              }}
            />

            <Typography variant="caption" color="text.secondary">
              {algorithm} · {hash.length * 4}-bit digest
            </Typography>
          </Stack>
        )}
      </Stack>
    </ToolLayout>
  );
}
