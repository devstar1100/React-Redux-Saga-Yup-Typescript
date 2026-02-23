import { Theme, Typography, styled } from "@mui/material";
import React, { ReactNode } from "react";
import ErrorIcon from "../Icons/ErrorIcon";
import SuccessIcon from "../Icons/SuccessIcon";

export enum AlertVariant {
  "error" = "error",
  "warning" = "warning",
  success = "success",
}

interface Props {
  title: string;
  content?: ReactNode;
  variant: AlertVariant;
}

const Alert = ({ title, content, variant = AlertVariant.error }: Props) => {
  const icon = {
    [AlertVariant.error]: <ErrorIcon />,
    [AlertVariant.success]: <SuccessIcon />,
  };

  return (
    <Wrapper variant={variant}>
      <div className="icon-wrapper">{icon[AlertVariant.error]}</div>
      <Content variant={variant}>
        <Typography variant="custom1" fontFamily="fontFamily">
          {title}
        </Typography>
        {content}
      </Content>
    </Wrapper>
  );
};

const getAlertBackgroundStyles = (theme: Theme, variant: AlertVariant) => {
  switch (variant) {
    case AlertVariant.error:
      return {
        backgroundColor: theme.palette.danger[400],
        "& > .icon-wrapper > svg > path": { stroke: theme.palette.red[100] },
      };
    case AlertVariant.warning:
      return {
        backgroundColor: theme.palette.yellow[400],
        "& > .icon-wrapper > svg > path": { stroke: theme.palette.yellow[100] },
      };
    case AlertVariant.success:
      return {
        backgroundColor: theme.palette.green[400],
        "& > .icon-wrapper > svg > path": { stroke: theme.palette.green[100] },
      };
    default:
      return;
  }
};

const getAlertContentStyles = (theme: Theme, variant: AlertVariant) => {
  switch (variant) {
    case AlertVariant.error:
      return {
        "& > .MuiTypography-root": {
          color: theme.palette.red[100],
        },
      };
    case AlertVariant.success:
      return {
        "& > .MuiTypography-root": {
          color: theme.palette.textColor.white,
          fontWeight: "500",
        },
      };
    default:
      return;
  }
};

const Wrapper = styled("div")<{ variant: AlertVariant }>(({ theme, variant }) => ({
  padding: "12px 16px",
  display: "flex",
  alignItems: "start",
  gap: "10px",
  borderRadius: "10px",
  marginBottom: "18px",

  "& > .icon-wrapper": {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  ...getAlertBackgroundStyles(theme, variant),
}));

const Content = styled("div")<{ variant: AlertVariant }>(({ theme, variant }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "4px",

  ...getAlertContentStyles(theme, variant),
}));

export default Alert;
