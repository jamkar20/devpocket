
import { createTheme, type PaletteMode } from "@mui/material/styles";

export function createAppTheme(mode: PaletteMode) {
  const dark = mode === "dark";

  const colors = {
    primary: dark ? "#A8C7FA" : "#0B57D0",
    primaryContrast: dark ? "#062E6F" : "#FFFFFF",

    background: dark ? "#131314" : "#F8F9FA",
    paper: dark ? "#1E1F20" : "#FFFFFF",

    text: {
      primary: dark ? "#E3E3E3" : "#1F1F1F",
      secondary: dark ? "#A0A4AA" : "#5F6368",
    },

    divider: dark ? "#3C4043" : "#DADCE0",

    selected: dark ? "#30343B" : "#E8F0FE",
    hover: dark ? "#282A2C" : "#F0F4F9",
  };

  return createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        contrastText: colors.primaryContrast,
      },
      background: {
        default: colors.background,
        paper: colors.paper,
      },
      text: colors.text,
      divider: colors.divider,
      success: {
        main: dark ? "#81C995" : "#188038",
      },
      action: {
        hover: colors.hover,
        selected: colors.selected,
        active: colors.text.secondary,
      },
    },

    shape: {
      borderRadius: 12,
    },

    typography: {
      fontFamily: '"Google Sans", "Segoe UI", Tahoma, Arial, sans-serif',
      fontSize: 13,

      h1: {
        fontSize: "1.75rem",
        fontWeight: 500,
        letterSpacing: "-0.6px",
        lineHeight: 1.35,
      },

      h2: {
        fontSize: "1.15rem",
        fontWeight: 500,
      },

      h3: {
        fontSize: "1rem",
        fontWeight: 600,
      },

      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
      },

      body1: {
        fontSize: "0.875rem",
        lineHeight: 1.7,
      },

      body2: {
        fontSize: "0.8125rem",
        lineHeight: 1.7,
      },

      caption: {
        fontSize: "0.72rem",
        lineHeight: 1.5,
      },

      button: {
        textTransform: "none",
        fontWeight: 500,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          "*": {
            boxSizing: "border-box",
          },

          html: {
            minWidth: 800,
            minHeight: 500,
          },

          body: {
            margin: 0,
            minWidth: 800,
            minHeight: 500,
            backgroundColor: colors.background,
          },

          "#root": {
            minWidth: 800,
            minHeight: 500,
          },

          "button, input, textarea": {
            font: "inherit",
          },

          "::selection": {
            backgroundColor: dark ? "#394B65" : "#D3E3FD",
          },

          "*::-webkit-scrollbar": {
            width: 8,
            height: 8,
          },

          "*::-webkit-scrollbar-thumb": {
            backgroundColor: dark ? "#484A4D" : "#C7C9CC",
            borderRadius: 8,
          },

          "*::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            minHeight: 36,
            borderRadius: 999,
            boxShadow: "none",
          },

          contained: {
            boxShadow: "none",
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },

          notchedOutline: {
            borderColor: colors.divider,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },

          outlined: {
            borderColor: colors.divider,
          },
        },
      },

      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: 11,
            borderRadius: 8,
          },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            transition: "background-color 140ms ease, color 140ms ease",
          },
        },
      },

      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.divider,
          },
        },
      },
    },
  });
}
