export type ToolDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
};

export type ToolCategory = {
  id: string;
  name: string;
  icon: string;
};

export const categories: ToolCategory[] = [
  { id: "conversion", name: "Conversion", icon: "arrow-left-right" },
  { id: "encoding", name: "Encoding", icon: "binary" },
  { id: "formatting", name: "Formatting", icon: "braces" },
];

export const tools: ToolDefinition[] = [
  {
    id: "decimal-hex",
    name: "Decimal ↔ Hex",
    description: "Convert decimal numbers to hexadecimal and back.",
    category: "conversion",
    icon: "arrow-left-right",
  },
  {
    id: "base64",
    name: "Base64",
    description: "Encode and decode Base64 strings.",
    category: "encoding",
    icon: "binary",
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format and inspect JSON data.",
    category: "formatting",
    icon: "braces",
  },
];
