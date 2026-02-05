import { styled } from "@mui/material/styles";
import { Grid } from "@mui/material";
import Textfield from "../Textfield/Textfield";
import InputIcon from "../Icons/InputIcon";

interface Props {
  value: string;
  onChange: (nextValue: string) => void;
}

const InputSearch = ({ value, onChange }: Props) => (
  <Wrapper container alignItems="center" width="fit-content">
    <InputIcon />
    <Textfield value={value} onChange={(e) => onChange(e.target.value)} size="small" placeholder="Search" />
  </Wrapper>
);

const Wrapper = styled(Grid)(({ theme }) => ({
  paddingLeft: "12px",
  border: `1px solid ${theme.palette.additional[700]} !important`,
  borderRadius: theme.borderRadius.xs,
  backgroundColor: theme.palette.additional[700],
  flexWrap: "nowrap",
  input: {
    "&::placeholder": {
      textOverflow: "ellipsis !important",
      color: `${theme.palette.main[200]}!important`,
    },
  },
  "& .MuiInputBase-input": {
    padding: "9px 12px 9px 5px",
  },
  "& .MuiFormLabel-root": {
    left: "-9px",
    top: "-2px",
    [theme.breakpoints.down("md")]: {
      top: "1px",
    },
  },
  "& fieldset": {
    border: `1px solid transparent !important`,
    borderRadius: theme.borderRadius.xs,
  },
  "& .MuiOutlinedInput-notchedOutline:focus-visible": {
    border: `1px solid transparent !important`,
  },
  "& .MuiOutlinedInput-root.Mui-focused fieldset": {
    border: `1px solid transparent !important`,
  },
}));

export default InputSearch;
