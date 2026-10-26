
import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Compress,
  ContentCopy,
  FormatAlignLeft,
} from "@mui/icons-material";

import ToolLayout from "../components/tool-ui/ToolLayout";
import ToolField from "../components/tool-ui/ToolField";
import { useToolFeedback } from "../components/tool-ui/ToolFeedbackProvider";

type FormatMode = "pretty" | "minify";

export default function JsonFormatter() {
  const { copy, notify } = useToolFeedback();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<FormatMode>("pretty");
  const [indent, setIndent] = useState(2);
  const [editedOutput, setEditedOutput] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) {
      return { value: "", error: "" };
    }

    try {
      const parsed: unknown = JSON.parse(input);
      const value =
        mode === "pretty"
          ? JSON.stringify(parsed, null, indent)
          : JSON.stringify(parsed);

      return { value, error: "" };
    } catch (error) {
      return {
        value: "",
        error: error instanceof Error ? error.message : "Invalid JSON.",
      };
    }
  }, [input, mode, indent]);

  const displayedOutput = editedOutput ? output : result.value;
  const lineCount = displayedOutput
    ? displayedOutput.split("\n").length
    : 0;

  function handleInputChange(value: string) {
    setInput(value);
    setOutput("");
    setEditedOutput(false);
  }

  function handleModeChange(value: FormatMode) {
    setMode(value);
    setOutput("");
    setEditedOutput(false);
  }

  function handleFormat() {
    if (!result.value) return;

    setOutput(result.value);
    setEditedOutput(false);
    notify(mode === "pretty" ? "JSON formatted." : "JSON minified.");
  }

  function clear() {
    setInput("");
    setOutput("");
    setEditedOutput(false);
  }

  async function copyInput() {
    if (!input) return;
    await copy(input, "JSON input");
  }

  async function copyOutput() {
    if (!displayedOutput) return;
    await copy(displayedOutput, "JSON output");
  }

  const headerSx = {
    minHeight: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 1,
    minWidth: 0,
  };

  const copyButtonSx = {
    minWidth: 0,
    px: 0.75,
    whiteSpace: "nowrap",
    flexShrink: 0,
  };

  return (
    <ToolLayout onReset={clear} resetLabel="Clear JSON">
      <Stack spacing={1.5}>
        {/* Controls */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ alignItems: { xs: "stretch", sm: "center" } }}
        >
          <TextField
            select
            size="small"
            label="Format"
            value={mode}
            onChange={(event) =>
              handleModeChange(event.target.value as FormatMode)
            }
            sx={{ minWidth: { sm: 155 } }}
          >
            <MenuItem value="pretty">Pretty Print</MenuItem>
            <MenuItem value="minify">Minify</MenuItem>
          </TextField>

          {mode === "pretty" && (
            <TextField
              select
              size="small"
              label="Indentation"
              value={indent}
              onChange={(event) => {
                setIndent(Number(event.target.value));
                setOutput("");
                setEditedOutput(false);
              }}
              sx={{ minWidth: { sm: 125 } }}
            >
              <MenuItem value={2}>2 spaces</MenuItem>
              <MenuItem value={4}>4 spaces</MenuItem>
            </TextField>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            variant="contained"
            size="small"
            startIcon={
              mode === "pretty" ? <FormatAlignLeft /> : <Compress />
            }
            disabled={!result.value}
            onClick={handleFormat}
          >
            {mode === "pretty" ? "Format JSON" : "Minify JSON"}
          </Button>
        </Stack>

        {/* Input and output */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
            alignItems: "start",
          }}
        >
          {/* Input */}
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Box sx={headerSx}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Input
              </Typography>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center" }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {input.length.toLocaleString()} chars
                </Typography>

                <Button
                  size="small"
                  variant="text"
                  startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                  disabled={!input}
                  onClick={() => void copyInput()}
                  sx={copyButtonSx}
                >
                  Copy
                </Button>
              </Stack>
            </Box>

            <ToolField
              label="JSON input"
              value={input}
              onChange={handleInputChange}
              placeholder={'{\n  "name": "DevPocket",\n  "version": 1\n}'}
              multiline
              minRows={12}
              error={Boolean(result.error)}
              helperText={undefined}
              copyable={false}
            />

            {result.error ? (
              <Alert
                severity="error"
                variant="outlined"
                sx={{
                  py: 0,
                  "& .MuiAlert-message": {
                    py: 0.5,
                    overflowWrap: "anywhere",
                  },
                }}
              >
                {result.error}
              </Alert>
            ) : input.trim() ? (
              <Typography variant="caption" color="success.main">
                Valid JSON
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Paste or type JSON to validate.
              </Typography>
            )}
          </Stack>

          {/* Output */}
          <Stack spacing={0.75} sx={{ minWidth: 0 }}>
            <Box sx={headerSx}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Output
              </Typography>

              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  alignItems: "center",
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {displayedOutput.length.toLocaleString()} chars · {lineCount}{" "}
                  lines
                </Typography>

                <Button
                  size="small"
                  variant="text"
                  startIcon={<ContentCopy sx={{ fontSize: 16 }} />}
                  disabled={!displayedOutput}
                  onClick={() => void copyOutput()}
                  sx={copyButtonSx}
                >
                  Copy
                </Button>
              </Stack>
            </Box>

            <ToolField
              label="JSON output"
              value={displayedOutput}
              onChange={(value) => {
                setOutput(value);
                setEditedOutput(true);
              }}
              placeholder="Formatted JSON will appear here..."
              multiline
              minRows={12}
              copyable={false}
            />

            {editedOutput && (
              <Typography variant="caption" color="text.secondary">
                Output manually edited. Change the input or format settings to
                regenerate it.
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </ToolLayout>
  );
}
