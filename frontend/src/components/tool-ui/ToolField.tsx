import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";
import { useToolFeedback } from "./ToolFeedbackProvider";

interface ToolFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  multiline?: boolean;
  minRows?: number;
  disabled?: boolean;
  copyable?: boolean;
}

export default function ToolField({
  label,
  value,
  onChange = (_val) => {},
  placeholder,
  error = false,
  helperText,
  multiline = false,
  minRows = 3,
  disabled = false,
  copyable = false,
}: ToolFieldProps) {
  const { copy } = useToolFeedback();

  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      multiline={multiline}
      minRows={multiline ? minRows : undefined}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{
        htmlInput: {
          spellCheck: false,
          ...(multiline ? {} : { dir: "ltr" as const }),
          style: {
            fontSize: 13,
          },
        },
        input: {
          endAdornment: copyable ? (
            <InputAdornment position="end">
              <Tooltip title="Copy value">
                <IconButton
                  edge="end"
                  size="small"
                  disabled={!value}
                  onClick={() => void copy(value)}
                  aria-label={`Copy ${label}`}
                >
                  <ContentCopy sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
