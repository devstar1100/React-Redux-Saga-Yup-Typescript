import { FormControl, InputLabel, styled, TextField } from "@mui/material";
import { FC, FocusEventHandler, ChangeEvent } from "react";
import ErrorIcon from "../Icons/ErrorIcon";

interface InputProps {
  value: string | number;
  handleChange: (e: ChangeEvent<any>) => void;
  onBlur?: FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>;
  formikName?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string | undefined;
  type?: HTMLInputElement["type"];
  InputProps?: any;
}

const Input: FC<InputProps> = ({
  value,
  handleChange,
  onBlur,
  formikName,
  label,
  placeholder,
  disabled,
  fullWidth,
  error,
  helperText,
  type = "text",
  InputProps,
}) => (
  <CustomFormControl fullWidth={fullWidth} disabled={disabled} error={error} className={error ? "error" : ""}>
    {label && (
      <InputLabel sx={{ marginBottom: "10px" }} shrink>
        {label}
      </InputLabel>
    )}
    <InputWrapper>
      <CustomTextField
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        name={formikName}
        helperText={error && helperText}
        type={type}
        fullWidth={fullWidth}
        onBlur={onBlur}
        InputProps={InputProps}
        disabled={disabled}
      />
      {error && (
        <IconWrapper className="error-icon">
          <ErrorIcon />
        </IconWrapper>
      )}
    </InputWrapper>
  </CustomFormControl>
);

export const CustomTextField = styled(TextField)(({ theme }) => ({
  height: "56px",

  "& .MuiInputBase-input": {
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: theme.typography.body2.fontWeight,
    backgroundColor: theme.palette.additional[700],
    borderRadius: "8px",
    padding: "12px 16px",
    color: theme.palette.main[50],

    "&::placeholder": {
      opacity: 1,
      color: theme.palette.main[200],
    },

    "&:disabled": {
      color: theme.palette.main[200],
      WebkitTextFillColor: theme.palette.main[200],
    },

    "&::-webkit-inner-spin-button": {
      WebkitAppearance: "none",
      margin: 0,
    },
  },
}));

const CustomFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiFormControl-root": {
    height: "auto",
  },

  "& .MuiFormLabel-root": {
    display: "inline",
    position: "relative",
    fontSize: theme.typography.body2.fontSize,
    lineHeight: theme.typography.body2.lineHeight,
    fontWeight: theme.typography.body2.fontWeight,
    color: theme.palette.main[50],
    transform: "translate(0,0) scale(1)",
    overflow: "visible",
  },

  "&.error .MuiInputBase-input": {
    border: `1px solid ${theme.palette.error.main}`,
  },

  "&.error .MuiFormLabel-root": {
    color: theme.palette.main[50],
  },

  "& .MuiFormHelperText-root": {
    color: theme.palette.error.main,
    marginLeft: 0,
  },

  "& .MuiInputBase-root:hover fieldset, & fieldset": {
    border: "none",
  },

  "& .MuiInputBase-root": {
    padding: 0,
  },
}));

const InputWrapper = styled("div")({
  position: "relative",
  width: "100%",
});

const IconWrapper = styled("div")({
  position: "absolute",
  top: "15px",
  right: "18px",

  "@media(max-width: 1200px)": {
    top: "7px",
    right: "10px",
  },
});

export default Input;
