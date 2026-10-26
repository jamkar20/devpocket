import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";
import forge from "node-forge";

import ToolLayout from "../components/tool-ui/ToolLayout";
import ToolField from "../components/tool-ui/ToolField";
import { useToolFeedback } from "../components/tool-ui/ToolFeedbackProvider";

type Operation = "encrypt" | "decrypt";

type Padding =
  | "pkcs1"
  | "oaep-sha1"
  | "oaep-sha256"
  | "oaep-sha384"
  | "oaep-sha512";

type Encoding = "utf8" | "hex" | "base64";

const paddings: { value: Padding; label: string }[] = [
  { value: "oaep-sha256", label: "OAEP · SHA-256" },
  { value: "oaep-sha384", label: "OAEP · SHA-384" },
  { value: "oaep-sha512", label: "OAEP · SHA-512" },
  { value: "oaep-sha1", label: "OAEP · SHA-1 (Legacy)" },
  { value: "pkcs1", label: "PKCS#1 v1.5 (Legacy)" },
];

const encodings: { value: Encoding; label: string }[] = [
  { value: "utf8", label: "UTF-8" },
  { value: "hex", label: "Hex" },
  { value: "base64", label: "Base64" },
];

function parseInput(value: string, encoding: Encoding): string {
  switch (encoding) {
    case "utf8":
      return forge.util.encodeUtf8(value);

    case "hex": {
      const hex = value.trim().replace(/\s+/g, "").replace(/^0x/i, "");

      if (!hex) {
        throw new Error("Enter hexadecimal input.");
      }

      if (!/^(?:[0-9a-fA-F]{2})+$/.test(hex)) {
        throw new Error("Hex must contain complete byte pairs.");
      }

      return forge.util.hexToBytes(hex);
    }

    case "base64": {
      const base64 = value.replace(/\s+/g, "");

      if (
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
          base64,
        ) ||
        base64.length === 0
      ) {
        throw new Error("Invalid Base64 input.");
      }

      return forge.util.decode64(base64);
    }
  }
}

function formatOutput(bytes: string, encoding: Encoding): string {
  switch (encoding) {
    case "utf8":
      return new TextDecoder("utf-8", { fatal: true }).decode(
        Uint8Array.from(bytes, (char) => char.charCodeAt(0)),
      );

    case "hex":
      return forge.util.bytesToHex(bytes).toUpperCase();

    case "base64":
      return forge.util.encode64(bytes);
  }
}

function getOaepOptions(padding: Exclude<Padding, "pkcs1">) {
  const hashName = {
    "oaep-sha1": "sha1",
    "oaep-sha256": "sha256",
    "oaep-sha384": "sha384",
    "oaep-sha512": "sha512",
  }[padding];

  const md =
    hashName === "sha1"
      ? forge.md.sha1.create()
      : hashName === "sha256"
        ? forge.md.sha256.create()
        : hashName === "sha384"
          ? forge.md.sha384.create()
          : forge.md.sha512.create();

  return { md, mgf1: { md } };
}

function getPaddingOptions(padding: Padding) {
  if (padding === "pkcs1") {
    return {
      scheme: "RSAES-PKCS1-V1_5",
      hashBytes: 11,
    } as const;
  }

  const options = getOaepOptions(padding);

  return {
    scheme: "RSA-OAEP",
    hashBytes: (2 * options.md.digestLength) / 8 + 2,
    options,
  } as const;
}

export default function RsaTool() {
  const { notify } = useToolFeedback();

  const [operation, setOperation] = useState<Operation>("encrypt");
  const [padding, setPadding] = useState<Padding>("oaep-sha256");
  const [inputEncoding, setInputEncoding] = useState<Encoding>("utf8");
  const [outputEncoding, setOutputEncoding] = useState<Encoding>("base64");
  const [key, setKey] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [keyInfo, setKeyInfo] = useState("");

  const isEncrypt = operation === "encrypt";

  function clear() {
    setKey("");
    setInput("");
    setOutput("");
    setError("");
    setKeyInfo("");
  }

  function changeOperation(next: Operation) {
    setOperation(next);
    setKey("");
    setInput("");
    setOutput("");
    setError("");
    setKeyInfo("");
  }

  function execute() {
    setError("");
    setOutput("");
    setKeyInfo("");

    try {
      if (!key.trim()) {
        throw new Error(
          `Enter a ${isEncrypt ? "public" : "private"} RSA key in PEM format.`,
        );
      }

      if (!input.trim()) {
        throw new Error("Enter the input data.");
      }

      let result: string;
      let modulusBits: number;

      if (isEncrypt) {
        const publicKey = forge.pki.publicKeyFromPem(key.trim());

        if (!("n" in publicKey) || !("encrypt" in publicKey)) {
          throw new Error("The PEM does not contain an RSA public key.");
        }

        modulusBits = publicKey.n.bitLength();

        const data = parseInput(input, inputEncoding);
        const options = getPaddingOptions(padding);
        const modulusBytes = Math.ceil(modulusBits / 8);
        const maxBytes = modulusBytes - options.hashBytes;

        if (data.length > maxBytes) {
          throw new Error(
            `Input is ${data.length} bytes; this key and padding allow at most ${maxBytes} bytes.`,
          );
        }

        result =
          padding === "pkcs1"
            ? publicKey.encrypt(data, options.scheme)
            : publicKey.encrypt(data, options.scheme, options.options);
      } else {
        const privateKey = forge.pki.privateKeyFromPem(key.trim());

        modulusBits = privateKey.n.bitLength();

        const ciphertext = parseInput(input, inputEncoding);
        const modulusBytes = Math.ceil(modulusBits / 8);

        if (ciphertext.length !== modulusBytes) {
          throw new Error(
            `Ciphertext must be exactly ${modulusBytes} bytes for this RSA key.`,
          );
        }

        const options = getPaddingOptions(padding);

        result =
          padding === "pkcs1"
            ? privateKey.decrypt(ciphertext, options.scheme)
            : privateKey.decrypt(ciphertext, options.scheme, options.options);
      }

      setOutput(formatOutput(result, outputEncoding));
      setKeyInfo(`${modulusBits}-bit RSA`);
      notify(
        isEncrypt ? "Encryption completed." : "Decryption completed.",
        "success",
      );
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "RSA operation failed. Check the key, input and padding.";

      setError(message);
      notify(message, "error");
    }
  }

  return (
    <ToolLayout onReset={clear} resetLabel="Clear RSA form">
      <Stack spacing={2}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={operation}
          onChange={(_, value: Operation | null) => {
            if (value) changeOperation(value);
          }}
          sx={{
            "& .MuiToggleButton-root": {
              py: 1,
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <ToggleButton value="encrypt">
            <Lock sx={{ fontSize: 17, mr: 1 }} />
            Encrypt
          </ToggleButton>

          <ToggleButton value="decrypt">
            <LockOpen sx={{ fontSize: 17, mr: 1 }} />
            Decrypt
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          select
          fullWidth
          size="small"
          label="Padding"
          value={padding}
          onChange={(event) => {
            setPadding(event.target.value as Padding);
            setOutput("");
            setError("");
          }}
        >
          {paddings.map((item) => (
            <MenuItem key={item.value} value={item.value}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          multiline
          minRows={4}
          maxRows={8}
          size="small"
          label={isEncrypt ? "Public Key (PEM)" : "Private Key (PEM)"}
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder={
            isEncrypt
              ? "-----BEGIN PUBLIC KEY-----"
              : "-----BEGIN PRIVATE KEY-----"
          }
          slotProps={{
            htmlInput: {
              spellCheck: false,
              style: {
                fontFamily: "Consolas, monospace",
                fontSize: 12,
                direction: "ltr",
                textAlign: "left",
              },
            },
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <TextField
            select
            fullWidth
            size="small"
            label="Input encoding"
            value={inputEncoding}
            onChange={(event) => {
              setInputEncoding(event.target.value as Encoding);
              setOutput("");
            }}
          >
            {encodings.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            size="small"
            label="Output encoding"
            value={outputEncoding}
            onChange={(event) => {
              setOutputEncoding(event.target.value as Encoding);
              setOutput("");
            }}
          >
            {encodings.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <ToolField
          label={isEncrypt ? "Plaintext" : "Ciphertext"}
          value={input}
          onChange={(value) => {
            setInput(value);
            setError("");
            setOutput("");
          }}
          multiline
          minRows={3}
          placeholder={
            isEncrypt
              ? "Enter the data to encrypt..."
              : "Paste the encrypted data..."
          }
        />

        <Button
          variant="contained"
          onClick={execute}
          startIcon={isEncrypt ? <Lock /> : <LockOpen />}
        >
          {isEncrypt ? "Encrypt" : "Decrypt"}
        </Button>

        {error && (
          <Alert
            severity="error"
            variant="outlined"
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}

        {keyInfo && !error && (
          <Typography variant="caption" color="text.secondary">
            {keyInfo}
          </Typography>
        )}

        <ToolField
          label="Output"
          value={output}
          multiline
          minRows={3}
          copyable
          placeholder="Output will appear here..."
        />

        <Typography variant="caption" color="text.secondary">
          RSA is intended for short messages. For larger data, use hybrid
          encryption with a symmetric cipher such as AES-GCM.
        </Typography>
      </Stack>
    </ToolLayout>
  );
}
