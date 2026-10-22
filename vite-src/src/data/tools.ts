import { Numbers, DataObject } from "@mui/icons-material";

export const categories = [
  {
    id: "converters",
    name: "Converters",
  },
  {
    id: "formatters",
    name: "Formatters",
  },
];

export const tools = [
  {
    id: "decimal-hex",
    name: "Decimal ↔ Hex",
    description: "Convert decimal integers and hexadecimal values.",
    category: "converters",
    icon: Numbers,
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format and inspect JSON data.",
    category: "formatters",
    icon: DataObject,
  },
] as const;

export type ToolId = (typeof tools)[number]["id"];
