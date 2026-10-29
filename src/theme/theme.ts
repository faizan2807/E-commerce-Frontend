import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === "dark" ? "#0b1120" : "#f8fafc",
        color: props.colorMode === "dark" ? "#f1f5f9" : "#1e293b",
        transitionProperty: "background-color, color",
        transitionDuration: "0.2s",
      },
    }),
  },
  colors: {
    brand: {
      50: "#fff1f2",
      100: "#ffe4e6",
      200: "#fecdd3",
      300: "#fda4af",
      400: "#fb7185",
      500: "#e53e3e",
      600: "#c53030",
      700: "#9b2c2c",
      800: "#742a2a",
      900: "#4a1d24",
    },
    dark: {
      canvas: "#0b1120",
      card: "#1e293b",
      cardHover: "#283548",
      border: "#334155",
      subtle: "#141c2e",
    },
  },
});

export default theme;
