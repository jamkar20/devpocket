import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import ToolLayout from "../components/tool-ui/ToolLayout";
import { useToolFeedback } from "../components/tool-ui/ToolFeedbackProvider";

type GuidFormat = "standard" | "no-hyphens" | "braces" | "parentheses" | "urn";

type OutputFormat = "lines" | "json" | "comma" | "quoted-lines";

const GUID_FORMATS: { value: GuidFormat; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "no-hyphens", label: "Without hyphens" },
  { value: "braces", label: "Braces { }" },
  { value: "parentheses", label: "Parentheses ( )" },
  { value: "urn", label: "URN format" },
];

const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "lines", label: "One per line" },
  { value: "json", label: "JSON array" },
  { value: "comma", label: "Comma separated" },
  { value: "quoted-lines", label: "Quoted lines" },
];

const DEFAULT_COUNT = 5;
const MAX_COUNT = 100;

function createGuid(): string {
  return crypto.randomUUID();
}

function createUniqueGuids(count: number): string[] {
  const unique = new Set<string>();

  while (unique.size < count) {
    unique.add(createGuid());
  }

  return Array.from(unique);
}

function formatGuid(
  guid: string,
  format: GuidFormat,
  uppercase: boolean,
): string {
  const compact = guid.replace(/-/g, "");
  let result: string;

  switch (format) {
    case "no-hyphens":
      result = compact;
      break;
    case "braces":
      result = `{${guid}}`;
      break;
    case "parentheses":
      result = `(${guid})`;
      break;
    case "urn":
      result = `urn:uuid:${guid}`;
      break;
    default:
      result = guid;
  }

  return uppercase ? result.toUpperCase() : result;
}

function formatOutput(guids: string[], format: OutputFormat): string {
  switch (format) {
    case "json":
      return JSON.stringify(guids, null, 2);
    case "comma":
      return guids.join(", ");
    case "quoted-lines":
      return guids.map((guid) => `"${guid}"`).join("\n");
    default:
      return guids.join("\n");
  }
}

export default function GuidGenerator() {
  const { copy, notify } = useToolFeedback();

  const [count, setCount] = useState(DEFAULT_COUNT);
  const [countInput, setCountInput] = useState(String(DEFAULT_COUNT));
  const [uppercase, setUppercase] = useState(false);
  const [format, setFormat] = useState<GuidFormat>("standard");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("lines");
  const [guids, setGuids] = useState<string[]>(() =>
    createUniqueGuids(DEFAULT_COUNT),
  );

  const formattedGuids = guids.map((guid) =>
    formatGuid(guid, format, uppercase),
  );

  function generateGuids() {
    setGuids(createUniqueGuids(count));
    notify(`${count} GUIDs generated.`);
  }

  function handleCountChange(value: string) {
    setCountInput(value);

    if (!/^\d+$/.test(value)) return;

    const parsed = Number(value);

    if (parsed >= 1 && parsed <= MAX_COUNT) {
      setCount(parsed);
    }
  }

  function handleCountBlur() {
    if (
      countInput === "" ||
      !/^\d+$/.test(countInput) ||
      Number(countInput) < 1 ||
      Number(countInput) > MAX_COUNT
    ) {
      setCountInput(String(count));
    }
  }

  async function copyAll() {
    if (formattedGuids.length === 0) return;

    await copy(formatOutput(formattedGuids, outputFormat), "GUIDs");
  }

  function clearResults() {
    setGuids([]);
    notify("Results cleared.");
  }

  function reset() {
    setCount(DEFAULT_COUNT);
    setCountInput(String(DEFAULT_COUNT));
    setUppercase(false);
    setFormat("standard");
    setOutputFormat("lines");
    setGuids(createUniqueGuids(DEFAULT_COUNT));
    notify("GUID generator reset.");
  }

  return (
    <ToolLayout onReset={reset} resetLabel="Reset GUID generator">
      <Stack spacing={2} sx={{ minWidth: 0 }}>
        {/* Configuration */}
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <TextField
              select
              size="small"
              label="GUID format"
              value={format}
              onChange={(event) => setFormat(event.target.value as GuidFormat)}
              sx={{ flex: 1, minWidth: 0 }}
            >
              {GUID_FORMATS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              size="small"
              type="number"
              label="Count"
              value={countInput}
              onChange={(event) => handleCountChange(event.target.value)}
              onBlur={handleCountBlur}
              slotProps={{
                htmlInput: { min: 1, max: MAX_COUNT, step: 1 },
              }}
              sx={{ width: { xs: "100%", sm: 110 } }}
            />

            <Button
              variant="contained"
              size="medium"
              startIcon={<AutorenewRoundedIcon />}
              onClick={generateGuids}
              sx={{ minHeight: 40, whiteSpace: "nowrap", flexShrink: 0 }}
            >
              Generate
            </Button>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 0, sm: 2 }}
            sx={{
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <FormControlLabel
              sx={{ ml: 0, mr: 1 }}
              control={
                <Checkbox
                  size="small"
                  checked={uppercase}
                  onChange={(event) => setUppercase(event.target.checked)}
                />
              }
              label={<Typography variant="body2">Uppercase</Typography>}
            />

            <Typography variant="caption" color="text.secondary">
              Generate 1–{MAX_COUNT} unique UUID v4 identifiers
            </Typography>
          </Stack>
        </Stack>

        {/* Results toolbar */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            minWidth: 0,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Results{" "}
            <Box
              component="span"
              sx={{ color: "text.secondary", fontWeight: 400 }}
            >
              ({formattedGuids.length})
            </Box>
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: "center", minWidth: 0 }}
          >
            <TextField
              select
              size="small"
              value={outputFormat}
              onChange={(event) =>
                setOutputFormat(event.target.value as OutputFormat)
              }
              slotProps={{ select: { displayEmpty: true } }}
              sx={{
                minWidth: { xs: 130, sm: 155 },
                "& .MuiSelect-select": { py: 1 },
              }}
              aria-label="Output format"
            >
              {OUTPUT_FORMATS.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => void copyAll()}
              disabled={formattedGuids.length === 0}
              sx={{ whiteSpace: "nowrap", minHeight: 40 }}
            >
              Copy all
            </Button>

            <Tooltip title="Clear results">
              <span>
                <IconButton
                  size="small"
                  aria-label="Clear results"
                  disabled={guids.length === 0}
                  onClick={clearResults}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>

        {/* GUID list */}
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          {formattedGuids.map((guid, index) => (
            <Box
              key={guids[index]}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                px: { xs: 1, sm: 1.25 },
                py: 0.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  flex: 1,
                  minWidth: 0,
                  overflowWrap: "anywhere",
                  fontFamily: "Consolas, 'Courier New', monospace",
                  fontSize: 13,
                  lineHeight: 1.7,
                  userSelect: "text",
                }}
              >
                {guid}
              </Typography>

              <Tooltip title={`Copy GUID ${index + 1}`}>
                <IconButton
                  size="small"
                  aria-label={`Copy GUID ${index + 1}`}
                  onClick={() => void copy(guid, `GUID ${index + 1}`)}
                  sx={{ flexShrink: 0 }}
                >
                  <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </Box>
          ))}

          {guids.length === 0 && (
            <Box
              sx={{
                py: 4,
                px: 2,
                textAlign: "center",
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No GUIDs generated.
              </Typography>

              <Button
                size="small"
                onClick={generateGuids}
                startIcon={<AutorenewRoundedIcon />}
                sx={{ mt: 1 }}
              >
                Generate GUIDs
              </Button>
            </Box>
          )}
        </Stack>
      </Stack>
    </ToolLayout>
  );
}
