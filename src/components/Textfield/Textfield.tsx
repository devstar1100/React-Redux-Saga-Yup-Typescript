import { styled, TextField as MuiTextField, TextFieldProps as MUITextFieldProps, Theme } from "@mui/material";
import React, { FC, ReactElement } from "react";

type CustomTextFieldColor = "primary" | "secondary";
type CustomTextFieldSize = "customMedium" | "customSmall";

export interface CustomTextFieldProps {
  color?: CustomTextFieldColor;
  customSize?: CustomTextFieldSize;
  type?: string;
  startAdornment?: ReactElement;
}

export type TextFieldProps = Omit<MUITextFieldProps, "color" | "customSmall"> & CustomTextFieldProps;

const Textfield: FC<TextFieldProps> = ({
  color = "primary",
  customSize = "customMedium",
  type,
  startAdornment,
  ...props
}): ReactElement => {
  return (
    <Wrapper>
      {startAdornment}
      <TextFieldStyled color={color} customSize={customSize} type={type} {...props} />
    </Wrapper>
  );
};

const Wrapper = styled("div")(() => ({
  position: "relative",

  "& > svg:first-of-type": {
    display: "block",
    position: "absolute",
    left: "13px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "11px",
    zIndex: 3,
  },
}));

const TextFieldStyled = styled(({ customSize, ...props }: TextFieldProps) => <MuiTextField {...props} />)(
  ({ theme, color, customSize }) => ({
    "& .MuiInputBase-input": {
      padding: "9px 12px",
      paddingLeft: "30px",
      height: "auto",
      fontSize: theme.typography.subtitle1.fontSize,
      lineHeight: theme.typography.subtitle1.lineHeight,
      fontWeight: theme.typography.subtitle1.fontWeight,
    },
    "& .MuiInputLabel-root": {
      color: theme.palette.main[200],
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: theme.palette.main[200],
    },
    ...getCustomColor(theme)[color as CustomTextFieldColor],
    ...getCustomSize()[customSize as CustomTextFieldSize],
  }),
);

const getCustomColor = (theme: Theme) => ({
  primary: {
    "& fieldset": {
      border: `1px solid ${theme.palette.additional[700]} !important`,
      borderRadius: theme.borderRadius.xs,
    },
    "& .MuiOutlinedInput-notchedOutline:focus-visible": {
      border: `1px solid ${theme.palette.additional[700]} !important`,
      borderRadius: theme.borderRadius.xs,
    },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      border: `1px solid ${theme.palette.additional[700]} !important`,
      borderRadius: theme.borderRadius.xs,
    },
    "& input, & textarea": {
      zIndex: 1,
      color: `${theme.palette.textColor.main} !important`,
      fontWeight: 400,
    },
    "& input::placeholder": {
      letterSpacing: "-0.24px",
      color: "#131313",
      opacity: 0.5,
    },
    "& input.MuiOutlinedInput-input": {
      zIndex: 1,
      fontWeight: 500,
      color: theme.palette.textColor.dark,
    },
  },
  secondary: {
    "& fieldset": {
      border: `border: 1px solid ${theme.palette.additional[700]} !important`,
      borderRadius: theme.borderRadius.xs,
      backgroundColor: theme.palette.grey[500],
    },
    "& .MuiOutlinedInput-notchedOutline:focus-visible": {
      border: `1px solid ${theme.palette.additional[700]} !important`,
      borderRadius: theme.borderRadius.xs,
    },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      border: `1px solid ${theme.palette.additional[700]} !important`,
      borderRadius: theme.borderRadius.xs,
    },
    "& input, & textarea": {
      zIndex: 1,
      color: `${theme.palette.grey[200]} !important`,
      fontWeight: 400,
    },
    "& input::placeholder": {
      letterSpacing: "-0.24px",
      color: theme.palette.grey[200],
    },
    "& input.MuiOutlinedInput-input": {
      zIndex: 1,
      fontWeight: 500,
      color: theme.palette.textColor.dark,
    },
  },
});

const getCustomSize = () => ({
  customSmall: {
    width: "100%",
    maxWidth: "60px",
  },
  customMedium: {
    width: "100%",
    maxWidth: "190px",
  },
});

export default Textfield;
