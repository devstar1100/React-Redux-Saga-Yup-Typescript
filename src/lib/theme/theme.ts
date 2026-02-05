import { CSSProperties } from "react";
import { PaletteColor, PaletteMode } from "@mui/material";

import { lightPalette } from "./lightPalette";
import { darkPalette } from "./darkPalette";
import { typography } from "./typography";
import { breakpoints } from "./breakpoints";
import { borderRadius } from "./borders";

const getPalette = (mode: PaletteMode) => {
  return {
    ...(mode === "light" ? lightPalette : darkPalette),
    mode,
  };
};

export const getTheme = () => ({
  breakpoints,
  borderRadius,
  typography,
  palette: darkPalette,
});

declare module "@mui/material/Typography" {
  export interface TypographyPropsVariantOverrides {
    customVariant: true;
    subtitle1: true;
    custom1: true;
    title: true;
  }
}

declare module "@mui/material/styles" {
  export interface ThemeOptions {
    borderRadius: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
  }

  export interface Theme {
    borderRadius: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    };
  }

  export interface TypographyVariants {
    customVariant: CSSProperties;
    secondaryFont: CSSProperties;
    allVariants: {
      fontFamily: CSSProperties;
      color: CSSProperties;
    };
    subtitle1: CSSProperties;
    title: CSSProperties;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface TypographyVariantsOptions {
    // customVariant: CSSProperties;
  }

  interface AdditionalTextColorProps {
    darkContrast?: string;
    main?: string;
    dark?: string;
    darkLight?: string;
    light?: string;
    white?: string;
    lightWhite?: string;
    secondary?: string;
    secondaryLight?: string;
    transparent?: string;
  }

  interface CustomPalette {
    social: any;
    contrastText: any;
    table: {
      tableHead: any;
      tableCell: any;
      tableBorder: any;
    };
    status: any;
    boxShadow: any;
    textColor: any;
    blue: any;
    green: any;
    red: any;
    yellow: any;
    violet: any;
    main: any;
    additional: any;
    aqua: any;
    liteblue: any;
    grey: any;
    danger: any;
    white: any;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Palette extends CustomPalette {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface PaletteOptions extends CustomPalette {}
}
