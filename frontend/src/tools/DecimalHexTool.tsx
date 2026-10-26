import { useMemo, useState } from "react";
import { Alert, Button, Grid, Stack, Typography } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ToolLayout from "../components/tool-ui/ToolLayout";
import ToolField from "../components/tool-ui/ToolField";

type RadixField = "decimal" | "hex" | "binary" | "octal";

const FIELD_CONFIG: {
  key: RadixField;
  label: string;
  radix: number;
  prefix?: string;
}[] = [
  { key: "decimal", label: "Decimal", radix: 10 },
  { key: "hex", label: "Hexadecimal", radix: 16, prefix: "0x" },
  { key: "binary", label: "Binary", radix: 2, prefix: "0b" },
  { key: "octal", label: "Octal", radix: 8, prefix: "0o" },
];

const INITIAL_VALUES: Record<RadixField, string> = {
  decimal: "",
  hex: "",
  binary: "",
  octal: "",
};

function parseInteger(value: string, radix: number): bigint {
  let normalized = value.trim().replace("_", "");

  if (!normalized) {
    throw new Error("Enter an integer value.");
  }

  let sign = 1n;

  if (normalized.startsWith("-")) {
    sign = -1n;
    normalized = normalized.slice(1);
  } else if (normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  if (radix === 16 && /^0x/i.test(normalized)) {
    normalized = normalized.slice(2);
  }

  if (radix === 2 && /^0b/i.test(normalized)) {
    normalized = normalized.slice(2);
  }

  if (radix === 8 && /^0o/i.test(normalized)) {
    normalized = normalized.slice(2);
  }

  if (!normalized) {
    throw new Error("Enter a valid integer.");
  }

  const validPatterns: Record<number, RegExp> = {
    2: /^[01]+$/,
    8: /^[0-7]+$/,
    10: /^\d+$/,
    16: /^[0-9a-f]+$/i,
  };

  if (!validPatterns[radix]?.test(normalized)) {
    throw new Error(`Invalid base-${radix} integer.`);
  }

  return (
    sign *
    BigInt(
      `${radix === 16 ? "0x" : radix === 8 ? "0o" : radix === 2 ? "0b" : ""}${normalized}`,
    )
  );
}

function formatInteger(value: bigint, radix: number): string {
  return value.toString(radix).toUpperCase();
}

function getFieldValues(value: bigint): Record<RadixField, string> {
  return {
    decimal: value.toString(10),
    hex: formatInteger(value, 16),
    binary: formatInteger(value, 2),
    octal: formatInteger(value, 8),
  };
}

export default function DecimalHexTool() {
  const [values, setValues] =
    useState<Record<RadixField, string>>(INITIAL_VALUES);
  const [activeField, setActiveField] = useState<RadixField>("decimal");
  const [error, setError] = useState<string | null>(null);

  const parsedValue = useMemo(() => {
    const current = values[activeField].trim();

    if (!current) {
      return null;
    }

    const config = FIELD_CONFIG.find((field) => field.key === activeField);

    try {
      return parseInteger(current, config!.radix);
    } catch {
      return null;
    }
  }, [values, activeField]);

  function handleChange(field: RadixField, rawValue: string) {
    setActiveField(field);
    setValues((previous) => ({
      ...previous,
      [field]: rawValue,
    }));

    if (!rawValue.trim()) {
      setError(null);
      return;
    }

    const config = FIELD_CONFIG.find((item) => item.key === field)!;

    try {
      const number = parseInteger(rawValue, config.radix);
      setValues(getFieldValues(number));
      setError(null);
    } catch {
      // Keep the user's in-progress input in the active field.
      setError(`Invalid ${config.label.toLowerCase()} value.`);
    }
  }

  function handleReset() {
    setValues(INITIAL_VALUES);
    setActiveField("decimal");
    setError(null);
  }

  const isEmpty = Object.values(values).every((value) => value.length === 0);

  return (
    <ToolLayout
      onReset={handleReset}
      actions={
        <Button
          size="small"
          startIcon={<ClearIcon />}
          onClick={handleReset}
          disabled={isEmpty}
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

        <Grid container spacing={2}>
          {FIELD_CONFIG.map((field) => (
            <Grid key={field.key} size={{ xs: 12, sm: 6 }}>
              <ToolField
                label={field.label}
                value={values[field.key]}
                onChange={(value) => handleChange(field.key, value)}
                placeholder={
                  field.prefix
                    ? `e.g. ${
                        field.radix === 16
                          ? "0xFF"
                          : field.radix === 2
                            ? "0b1010"
                            : "0o17"
                      }`
                    : "Enter a number"
                }
                error={Boolean(error) && activeField === field.key}
                copyable
              />
            </Grid>
          ))}
        </Grid>

        {parsedValue !== null && !error && (
          <Typography variant="caption" color="text.secondary">
            Value: {parsedValue.toString(10)}
          </Typography>
        )}
      </Stack>
    </ToolLayout>
  );
}
