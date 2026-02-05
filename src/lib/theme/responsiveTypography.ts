import { Theme as MUITheme } from "@mui/material/styles";

export const mutateFontSizeResponsiveness = (theme: MUITheme) => {
  theme.typography.body1 = {
    ...theme.typography.body1,
    [theme.breakpoints.down("lg")]: {
      fontSize: "14px",
      lineHeight: "20px",
    },
    [theme.breakpoints.down("md")]: {
      fontSize: "12px",
      lineHeight: "16px",
    },
  };
  theme.typography.body2 = {
    ...theme.typography.body2,
    [theme.breakpoints.down("lg")]: {
      fontSize: "12px",
      lineHeight: "18px",
    },
  };
  theme.typography.h6 = {
    ...theme.typography.h6,
    [theme.breakpoints.down("lg")]: {
      fontSize: "16px",
      lineHeight: "24px",
    },
  };
  theme.typography.subtitle1 = {
    ...theme.typography.subtitle1,
    [theme.breakpoints.down("lg")]: {
      fontSize: "11px",
      lineHeight: "14px",
    },
  };

  return theme;
};
