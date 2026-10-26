import {
  Numbers,
  DataObject,
  PaletteOutlined,
  FingerprintRounded,
  VpnKeyRounded,
  EnhancedEncryptionRounded,
  TransformRounded,
} from "@mui/icons-material";

export const categories = [
  {
    id: "converters",
    name: "Converters",
    description: "Convert values between different formats.",
  },
  {
    id: "encoders-decoders",
    name: "Encoders & Decoders",
    description: "Encode and decode text and binary data.",
  },
  {
    id: "formatters",
    name: "Formatters",
    description: "Format and validate structured data.",
  },
  {
    id: "cryptography",
    name: "Cryptography",
    description: "Encryption and cryptographic utilities.",
  },
  {
    id: "generators",
    name: "Generators",
    description: "Generate identifiers, codes, and keys.",
  },
] as const;

export const tools = [
  {
    id: "decimal-hex",
    name: "Number Base Converter",
    description:
      "Convert numbers between decimal, hexadecimal, binary, and octal.",
    category: "converters",
    icon: Numbers,
    tags: [
      "number",
      "base",
      "decimal",
      "hex",
      "hexadecimal",
      "binary",
      "octal",
      "integer",
      "radix",
    ],
  },
  {
    id: "color-converter",
    name: "Color Converter",
    description:
      "Convert colors between HEX, RGB, HSL, HSV, CMYK, and CSS formats.",
    category: "converters",
    icon: PaletteOutlined,
    tags: [
      "color",
      "colour",
      "hex",
      "rgb",
      "rgba",
      "hsl",
      "hsla",
      "hsv",
      "hsva",
      "cmyk",
      "css",
      "design",
    ],
  },
  {
    id: "decoder",
    name: "Text Encoder & Decoder",
    description:
      "Encode and decode Base64, Base64URL, hexadecimal, and UTF-8 text.",
    category: "encoders-decoders",
    icon: TransformRounded,
    tags: [
      "encode",
      "decode",
      "encoder",
      "decoder",
      "base64",
      "base64url",
      "hex",
      "hexadecimal",
      "utf8",
      "utf-8",
      "text",
      "binary",
    ],
  },
  {
    id: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and inspect JSON documents.",
    category: "formatters",
    icon: DataObject,
    tags: [
      "json",
      "format",
      "formatter",
      "pretty print",
      "validate",
      "validation",
      "minify",
      "beautify",
      "api",
      "data",
    ],
  },
  {
    id: "rsa",
    name: "RSA Encryption",
    description: "Encrypt and decrypt data using RSA public and private keys.",
    category: "cryptography",
    icon: EnhancedEncryptionRounded,
    tags: [
      "rsa",
      "encryption",
      "decryption",
      "encrypt",
      "decrypt",
      "public key",
      "private key",
      "asymmetric",
      "cryptography",
      "pkcs1",
      "oaep",
      "pem",
    ],
  },
  {
    id: "guid-generator",
    name: "UUID Generator",
    description:
      "Generate unique UUID v4 identifiers for applications and databases.",
    category: "generators",
    icon: FingerprintRounded,
    tags: [
      "uuid",
      "guid",
      "identifier",
      "unique id",
      "random",
      "v4",
      "database",
      "id",
    ],
  },
  {
    id: "otp-generator",
    name: "OTP Code Generator",
    description:
      "Generate time-based (TOTP) and counter-based (HOTP) one-time passwords.",
    category: "generators",
    icon: VpnKeyRounded,
    tags: [
      "otp",
      "totp",
      "hotp",
      "2fa",
      "mfa",
      "authentication",
      "authenticator",
      "one-time password",
      "security",
      "verification code",
    ],
  },
] as const;

export type Tool = (typeof tools)[number];
export type ToolId = Tool["id"];
export type ToolCategory = (typeof categories)[number]["id"];
export type ToolTag = Tool["tags"][number];
