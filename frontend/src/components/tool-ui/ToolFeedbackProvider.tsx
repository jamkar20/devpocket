import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Alert, Snackbar } from "@mui/material";

export type FeedbackSeverity = "success" | "error" | "info" | "warning";

interface FeedbackMessage {
  id: number;
  message: string;
  severity: FeedbackSeverity;
}

interface ToolFeedbackContextValue {
  notify: (message: string, severity?: FeedbackSeverity) => void;
  copy: (value: string, label?: string) => Promise<void>;
}

const ToolFeedbackContext =
  createContext<ToolFeedbackContextValue | null>(null);

export function ToolFeedbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [nextId, setNextId] = useState(0);

  const notify = useCallback(
    (message: string, severity: FeedbackSeverity = "success") => {
      setNextId((id) => id + 1);
      setFeedback((previous) => ({
        id: (previous?.id ?? nextId) + 1,
        message,
        severity,
      }));
    },
    [nextId],
  );

  const copy = useCallback(
    async (value: string, label = "Value") => {
      try {
        await navigator.clipboard.writeText(value);
        notify(`${label} copied to clipboard.`, "success");
      } catch {
        notify("Unable to access the clipboard.", "error");
      }
    },
    [notify],
  );

  const contextValue = useMemo(
    () => ({ notify, copy }),
    [notify, copy],
  );

  return (
    <ToolFeedbackContext.Provider value={contextValue}>
      {children}

      <Snackbar
        key={feedback?.id ?? "empty"}
        open={feedback !== null}
        autoHideDuration={2800}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        onClose={(_, reason) => {
          if (reason !== "clickaway") {
            setFeedback(null);
          }
        }}
      >
        {feedback ? (
          <Alert
            severity={feedback.severity}
            variant="filled"
            onClose={() => setFeedback(null)}
            sx={{ width: "100%" }}
          >
            {feedback.message}
          </Alert>
        ) : (
          <span />
        )}
      </Snackbar>
    </ToolFeedbackContext.Provider>
  );
}

export function useToolFeedback() {
  const context = useContext(ToolFeedbackContext);

  if (!context) {
    throw new Error(
      "useToolFeedback must be used within ToolFeedbackProvider.",
    );
  }

  return context;
}