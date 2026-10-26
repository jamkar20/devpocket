import { useMemo, useState } from "react";
import { Alert, Box, Grid, Paper, Stack, Typography } from "@mui/material";
import ToolLayout from "../components/tool-ui/ToolLayout";
import ToolField from "../components/tool-ui/ToolField";

type Color = {
  r: number;
  g: number;
  b: number;
  a: number;
};

type ColorFormat =
  | "hex"
  | "argb"
  | "rgb"
  | "rgba"
  | "hsl"
  | "hsla"
  | "hsv"
  | "hsva"
  | "cmyk"
  | "hue"
  | "css";

type FormatDefinition = {
  key: ColorFormat;
  label: string;
};

const FORMATS: FormatDefinition[] = [
  { key: "hex", label: "HEX" },
  { key: "argb", label: "ARGB" },
  { key: "rgb", label: "RGB" },
  { key: "rgba", label: "RGBA" },
  { key: "hsl", label: "HSL" },
  { key: "hsla", label: "HSLA" },
  { key: "hsv", label: "HSV" },
  { key: "hsva", label: "HSVA" },
  { key: "cmyk", label: "CMYK" },
  { key: "hue", label: "Hue" },
  { key: "css", label: "CSS" },
];

const INITIAL_COLOR: Color = {
  r: 66,
  g: 133,
  b: 244,
  a: 1,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const round = (value: number, decimals = 2) => Number(value.toFixed(decimals));

function normalizeColor(color: Color): Color {
  return {
    r: Math.round(clamp(color.r, 0, 255)),
    g: Math.round(clamp(color.g, 0, 255)),
    b: Math.round(clamp(color.b, 0, 255)),
    a: clamp(color.a, 0, 1),
  };
}

function toHexByte(value: number): string {
  return Math.round(value).toString(16).padStart(2, "0").toUpperCase();
}

function toHex(color: Color): string {
  return `#${toHexByte(color.r)}${toHexByte(color.g)}${toHexByte(color.b)}`;
}

function toArgb(color: Color): string {
  return `#${toHexByte(color.a * 255)}${toHexByte(color.r)}${toHexByte(color.g)}${toHexByte(color.b)}`;
}

function rgbToHsl(color: Color) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = 60 * (((g - b) / delta) % 6);
        break;
      case g:
        h = 60 * ((b - r) / delta + 2);
        break;
      default:
        h = 60 * ((r - g) / delta + 4);
    }
  }

  return {
    h: (h + 360) % 360,
    s: s * 100,
    l: l * 100,
  };
}

function hslToRgb(h: number, s: number, l: number): Color {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return normalizeColor({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
    a: 1,
  });
}

function rgbToHsv(color: Color) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;

  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6);
    else if (max === g) h = 60 * ((b - r) / delta + 2);
    else h = 60 * ((r - g) / delta + 4);
  }

  return {
    h: (h + 360) % 360,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
}

function hsvToRgb(h: number, s: number, v: number): Color {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  v = clamp(v, 0, 100) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return normalizeColor({
    r: (r + m) * 255,
    g: (g + m) * 255,
    b: (b + m) * 255,
    a: 1,
  });
}

function rgbToCmyk(color: Color) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;

  const k = 1 - Math.max(r, g, b);

  if (k >= 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  return {
    c: ((1 - r - k) / (1 - k)) * 100,
    m: ((1 - g - k) / (1 - k)) * 100,
    y: ((1 - b - k) / (1 - k)) * 100,
    k: k * 100,
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number): Color {
  c = clamp(c, 0, 100) / 100;
  m = clamp(m, 0, 100) / 100;
  y = clamp(y, 0, 100) / 100;
  k = clamp(k, 0, 100) / 100;

  return normalizeColor({
    r: 255 * (1 - c) * (1 - k),
    g: 255 * (1 - m) * (1 - k),
    b: 255 * (1 - y) * (1 - k),
    a: 1,
  });
}

function formatColor(color: Color): Record<ColorFormat, string> {
  const c = normalizeColor(color);
  const hsl = rgbToHsl(c);
  const hsv = rgbToHsv(c);
  const cmyk = rgbToCmyk(c);

  return {
    hex: toHex(c),
    argb: toArgb(c),
    rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
    rgba: `rgba(${c.r}, ${c.g}, ${c.b}, ${round(c.a, 3)})`,
    hsl: `hsl(${round(hsl.h)} ${round(hsl.s)}% ${round(hsl.l)}%)`,
    hsla: `hsla(${round(hsl.h)}, ${round(hsl.s)}%, ${round(hsl.l)}%, ${round(c.a, 3)})`,
    hsv: `hsv(${round(hsv.h)} ${round(hsv.s)}% ${round(hsv.v)}%)`,
    hsva: `hsva(${round(hsv.h)}, ${round(hsv.s)}%, ${round(hsv.v)}%, ${round(c.a, 3)})`,
    cmyk: `cmyk(${round(cmyk.c)}%, ${round(cmyk.m)}%, ${round(cmyk.y)}%, ${round(cmyk.k)}%)`,
    hue: `${round(hsl.h)}°`,
    css: toHex(c),
  };
}

function parseNumbers(value: string): number[] {
  const matches = value.match(/[-+]?(?:\d*\.)?\d+/g);

  if (!matches) {
    throw new Error("Enter a valid color value.");
  }

  const numbers = matches.map(Number);

  if (numbers.some((number) => !Number.isFinite(number))) {
    throw new Error("Enter valid numeric values.");
  }

  return numbers;
}

function parseHex(value: string, argb = false): Color {
  let hex = value.trim().replace(/^#/, "");

  if (/^0x/i.test(hex)) {
    hex = hex.slice(2);
  }

  if (!/^[\da-f]+$/i.test(hex)) {
    throw new Error("Enter a valid hexadecimal color.");
  }

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (hex.length === 4 && !argb) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (hex.length === 6) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  if (hex.length === 8) {
    if (argb) {
      return {
        a: parseInt(hex.slice(0, 2), 16) / 255,
        r: parseInt(hex.slice(2, 4), 16),
        g: parseInt(hex.slice(4, 6), 16),
        b: parseInt(hex.slice(6, 8), 16),
      };
    }

    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
      a: parseInt(hex.slice(6, 8), 16) / 255,
    };
  }

  throw new Error(
    argb
      ? "ARGB must contain 6 or 8 hexadecimal digits."
      : "HEX must contain 3, 4, 6, or 8 hexadecimal digits.",
  );
}

function parseColor(
  format: ColorFormat,
  value: string,
  previous: Color,
): Color {
  const input = value.trim();

  if (!input) {
    throw new Error("Enter a color value.");
  }

  if (format === "hex" || format === "css") {
    if (
      input.startsWith("#") ||
      /^0x/i.test(input) ||
      /^[\da-f]+$/i.test(input)
    ) {
      return parseHex(input);
    }

    const rgbMatch = input.match(/^rgba?\s*\((.*)\)$/i);

    if (rgbMatch) {
      const nums = parseNumbers(rgbMatch[1]);

      if (nums.length < 3 || nums.length > 4) {
        throw new Error("RGB requires 3 values; RGBA accepts 4.");
      }

      return normalizeColor({
        r: nums[0],
        g: nums[1],
        b: nums[2],
        a: nums.length === 4 ? nums[3] : 1,
      });
    }

    throw new Error("Use a HEX color or an rgb()/rgba() CSS value.");
  }

  if (format === "argb") {
    return parseHex(input, true);
  }

  const numbers = parseNumbers(input);

  switch (format) {
    case "rgb":
    case "rgba": {
      if (numbers.length < 3 || numbers.length > 4) {
        throw new Error("Enter R, G, B, and optionally alpha.");
      }

      return normalizeColor({
        r: numbers[0],
        g: numbers[1],
        b: numbers[2],
        a: numbers.length === 4 ? numbers[3] : 1,
      });
    }

    case "hsl":
    case "hsla": {
      if (numbers.length < 3 || numbers.length > 4) {
        throw new Error(
          "Enter hue, saturation, lightness, and optionally alpha.",
        );
      }

      const result = hslToRgb(numbers[0], numbers[1], numbers[2]);

      return {
        ...result,
        a: numbers.length === 4 ? clamp(numbers[3], 0, 1) : 1,
      };
    }

    case "hsv":
    case "hsva": {
      if (numbers.length < 3 || numbers.length > 4) {
        throw new Error("Enter hue, saturation, value, and optionally alpha.");
      }

      const result = hsvToRgb(numbers[0], numbers[1], numbers[2]);

      return {
        ...result,
        a: numbers.length === 4 ? clamp(numbers[3], 0, 1) : 1,
      };
    }

    case "cmyk": {
      if (numbers.length !== 4) {
        throw new Error("CMYK requires four values.");
      }

      return cmykToRgb(numbers[0], numbers[1], numbers[2], numbers[3]);
    }

    case "hue": {
      if (numbers.length !== 1) {
        throw new Error("Enter a single hue value.");
      }

      const hsl = rgbToHsl(previous);

      return {
        ...hslToRgb(numbers[0], hsl.s, hsl.l),
        a: previous.a,
      };
    }

    default:
      throw new Error("Unsupported color format.");
  }
}

export default function ColorConverter() {
  const [color, setColor] = useState<Color>(INITIAL_COLOR);
  const [drafts, setDrafts] = useState<Partial<Record<ColorFormat, string>>>(
    {},
  );
  const [activeField, setActiveField] = useState<ColorFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatted = useMemo(() => formatColor(color), [color]);

  const currentDrafts = useMemo(
    () => ({ ...formatted, ...drafts }),
    [formatted, drafts],
  );

  function handleChange(format: ColorFormat, value: string) {
    setActiveField(format);
    setDrafts((previous) => ({ ...previous, [format]: value }));

    if (!value.trim()) {
      setError(null);
      return;
    }

    try {
      const parsed = parseColor(format, value, color);
      setColor(normalizeColor(parsed));
      setDrafts({});
      setError(null);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to parse this color.",
      );
    }
  }

  function handleReset() {
    setColor(INITIAL_COLOR);
    setDrafts({});
    setActiveField(null);
    setError(null);
  }

  return (
    <ToolLayout onReset={handleReset} resetLabel="Reset color">
      <Stack spacing={2}>
        <Paper
          variant="outlined"
          sx={{
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box
            aria-label={`Color preview ${toHex(color)}`}
            sx={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
            }}
          />

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {toHex(color)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatted.rgb} · Alpha {round(color.a, 3)}
            </Typography>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" variant="outlined">
            {error}
          </Alert>
        )}

        <Grid container spacing={1.5}>
          {FORMATS.map((format) => (
            <Grid key={format.key} size={{ xs: 12, sm: 6, md: 4 }}>
              <ToolField
                label={format.label}
                value={currentDrafts[format.key]}
                onChange={(value) => handleChange(format.key, value)}
                error={Boolean(error) && activeField === format.key}
                placeholder={formatted[format.key]}
                copyable
              />
            </Grid>
          ))}
        </Grid>

        <Typography variant="caption" color="text.secondary">
          Tip: enter HEX values with or without the # prefix. RGB, HSL, HSV and
          CMYK fields accept comma-separated or space-separated numbers.
        </Typography>
      </Stack>
    </ToolLayout>
  );
}
