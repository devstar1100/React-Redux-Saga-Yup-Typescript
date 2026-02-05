import React from "react";
import { Button as MuiButton, ButtonProps as MUIButtonProps, Theme, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FC, ReactElement } from "react";

export interface CustomButtonProps {
  size?: "small" | "medium" | "large";
  color?: "green" | "gray" | "blue" | "red" | "transparent";
  disabled?: boolean;
  icon?: ReactElement;
  additionalSmallVariant?: boolean;
}

export type ButtonProps = Omit<MUIButtonProps, "color" | "size" | "disabled"> & CustomButtonProps;

const Button: FC<ButtonProps> = ({
  children,
  additionalSmallVariant = false,
  size = "medium",
  color = "gray",
  disabled = false,
  icon,
  ...props
}) => {
  const ButtonStyled = styled((props: MUIButtonProps) => <MuiButton {...props} />)(({ theme }) => ({
    ...getCustomSize(theme, additionalSmallVariant)[size],
    ...getCustomColor(theme, additionalSmallVariant, disabled)[color],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    transition: "0.4s",
    whiteSpace: "nowrap",
    opacity: disabled ? 0.4 : 1,
    textTransform: "none",
  }));

  return (
    <ButtonStyled {...props} disabled={disabled}>
      {icon}
      <Typography variant={additionalSmallVariant ? "subtitle1" : "body2"}>{children}</Typography>
    </ButtonStyled>
  );
};

const getCustomColor = (theme: Theme, additionalSmallVariant: boolean, disabled: boolean) => ({
  gray: {
    background: additionalSmallVariant ? theme.palette.additional[700] : theme.palette.additional[1000],
    border: additionalSmallVariant ? "1px solid transparent" : `1px solid ${theme.palette.main[300]}`,
    boxShadow: theme.palette.boxShadow.main,
    borderRadius: theme.borderRadius.md,
    h6: {
      color: theme.palette.main[100],
    },
    p: {
      color: theme.palette.main[100],
    },
    fontWeight: 600,
    "&:hover": {
      background: theme.palette.additional[1000],
    },
    "& svg": {
      stroke: theme.palette.main[100],
    },
  },
  green: {
    background: disabled ? theme.palette.additional[600] : theme.palette.green[400],
    border: "1px solid transparent",
    borderRadius: theme.borderRadius.lg,
    color: theme.palette.textColor.white,
    "& svg": {
      stroke: disabled ? theme.palette.main[100] : theme.palette.textColor.white,
    },
    "&:disabled": {
      color: theme.palette.textColor.light,
    },
    "&:hover": {
      background: disabled ? theme.palette.additional[600] : theme.palette.green[400],
      border: `1px solid ${theme.palette.green[400]}`,
    },
  },
  blue: {
    backgroundColor: theme.palette.blue[400],
    borderRadius: theme.borderRadius.lg,
    color: theme.palette.textColor.light,
    border: "1px solid transparent",

    "&:hover": {
      backgroundColor: theme.palette.blue[400],
      border: `1px solid ${theme.palette.blue[400]}`,
    },
  },
  red: {
    backgroundColor: theme.palette.danger[400],
    borderRadius: theme.borderRadius.lg,
    color: theme.palette.white,
    border: "1px solid transparent",

    "&:hover": {
      backgroundColor: theme.palette.danger[400],
      border: "1px solid transparent",
    },
  },
  transparent: {
    background: "transparent",
    border: additionalSmallVariant ? "1px solid transparent" : `1px solid ${theme.palette.main[300]}`,
    boxShadow: theme.palette.boxShadow.main,
    borderRadius: theme.borderRadius.md,
    h6: {
      color: theme.palette.main[100],
    },
    p: {
      color: theme.palette.main[100],
    },
    fontWeight: 600,
    "&:hover": {
      background: theme.palette.additional[1000],
    },
    "& svg": {
      stroke: theme.palette.main[100],
    },
  },
});

const getCustomSize = (theme: Theme, additionalSmallVariant: boolean) => ({
  small: {
    padding: additionalSmallVariant ? "9px 11px" : "11px 12px",
    minWidth: additionalSmallVariant ? "110px" : "130px",
    maxHeight: "42px",
  },
  medium: {
    minWidth: "160px",
    maxWidth: "280px",
    padding: additionalSmallVariant ? "9px 11px 9px 13px" : "11px 17px",
    width: "100%",
    maxHeight: "42px",
    [theme.breakpoints.down("lg")]: {
      maxWidth: "100%",
    },
    [theme.breakpoints.down("md")]: {
      padding: "9px",
    },
  },
  large: {
    maxWidth: "100%",
    height: "47px",
  },
});

export default React.memo(Button, (prev, next) => {
  if (prev.size !== next.size) return false;
  if (prev.color !== next.color) return false;
  if (prev.disabled !== next.disabled) return false;
  if (prev.additionalSmallVariant !== next.additionalSmallVariant) return false;
  if (prev.onClick !== next.onClick) return false;

  return true;
});
