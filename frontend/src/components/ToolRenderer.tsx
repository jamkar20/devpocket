import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import DecimalHexTool from "../tools/DecimalHexTool";
import DecodeTool from "../tools/DecodeTool";
import JsonFormatter from "../tools/JsonFormatter";
import RsaTool from "../tools/RsaTool";
import ColorConverter from "../tools/ColorConverter";
import GuidGenerator from "../tools/GuidGenerator";
import OtpGenerator from "../tools/OtpGenerator";
import HashTool from "../tools/HashTool";

interface ToolRendererProps {
  toolId: string;
}

function ComingSoon() {
  return (
    <Box
      sx={{
        minHeight: 280,
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 1,
      }}
    >
      <Typography variant="h3">Coming soon</Typography>

      <Typography variant="body2" color="text.secondary">
        This tool will be implemented in a future update.
      </Typography>
    </Box>
  );
}

export default function ToolRenderer({ toolId }: ToolRendererProps) {
  switch (toolId) {
    case "decimal-hex":
      return <DecimalHexTool />;

    case "decoder":
      return <DecodeTool />;

    case "json-formatter":
      return <JsonFormatter />;

    case "rsa":
      return <RsaTool />;

    case "color-converter":
      return <ColorConverter />;

    case "guid-generator":
      return <GuidGenerator />;

    case "otp-generator":
      return <OtpGenerator />;

    case "hash":
      return <HashTool />;

    default:
      return <ComingSoon />;
  }
}
