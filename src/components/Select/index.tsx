import {
  Grid,
  SelectChangeEvent,
  Typography,
  useTheme,
  Select as MUISelect,
  FormControl,
  MenuItem,
  styled,
} from "@mui/material";
import { CollapseArrowUp } from "../Icons/CollapseArrowUp";
import { CollapseArrowDown } from "../Icons/CollapseArrowDown";
import { FC, ReactElement, useState } from "react";

export type SelectOption = {
  id: string | number;
  label: string;
};

interface ISelect {
  options: string[] | SelectOption[];
  excludeOptions?: (string | number)[];
  value: string | number;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  onChange: (newValue: any) => void;
}

const Select: FC<ISelect> = ({
  options,
  excludeOptions = [],
  value,
  placeholder,
  disabled,
  onChange,
  error,
}): ReactElement => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const isStringArray = (arr: unknown[]): arr is string[] => arr.every((item) => typeof item === "string");

  const normalizedOptions: SelectOption[] = isStringArray(options)
    ? options.map((item) => ({ id: item, label: item }))
    : options;

  const availableOptions = normalizedOptions.filter((opt) => !excludeOptions.includes(opt.id));

  return (
    <Form className={`customSelect ${error ? "error" : ""}`}>
      <MUISelect
        IconComponent={() => <Grid className="arrowIcon">{open ? <CollapseArrowUp /> : <CollapseArrowDown />}</Grid>}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={value}
        disabled={disabled}
        displayEmpty
        onChange={(e) => onChange(e.target.value)}
        renderValue={(value) => {
          const selectedItem = normalizedOptions.find((opt) => opt.id === value);
          return (
            <Typography variant="subtitle1" color="textColor.lightWhite" pr="11px">
              {selectedItem?.label ?? placeholder}
            </Typography>
          );
        }}
        MenuProps={{
          PaperProps: {
            style: {
              backgroundColor: theme.palette.additional[700],
              borderRadius: "10px",
              padding: "2px 10px 10px",
              marginTop: "10px",
              maxHeight: "200px",
            },
          },
        }}
      >
        {availableOptions.map((item, index) => (
          <Item value={item.label === "Not defined" ? "" : item.id} key={index}>
            <Typography variant="subtitle1">{item.label}</Typography>
          </Item>
        ))}
      </MUISelect>
    </Form>
  );
};

const Item = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.textColor.lightWhite,
  border: "1px solid transparent !important",
  marginTop: "4px",
  "&.Mui-selected": {
    backgroundColor: `${theme.palette.additional[600]} !important`,
    borderRadius: `${theme.borderRadius.xs} !important`,
  },
  "&:hover": {
    border: `1px solid ${theme.palette.additional[600]} !important`,
    borderRadius: `${theme.borderRadius.xs} !important`,
  },
}));

const Form = styled(FormControl)(({ theme }) => ({
  maxWidth: "320px",
  position: "relative",
  borderRadius: theme.borderRadius.xs,
  backgroundColor: theme.palette.additional[700],
  zIndex: 0,

  "& .MuiSelect-select": {
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 12px",
    color: theme.palette.textColor.lightWhite,
    borderRadius: theme.borderRadius.xs,

    "&.Mui-disabled": {
      "-webkit-text-fill-color": theme.palette.main[100],
    },
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: `1px solid ${theme.palette.additional[700]} !important`,
  },
  "& .MuiFormLabel-root": {
    top: "-4px",
    color: theme.palette.textColor.lightWhite,
    [theme.breakpoints.down("xl")]: {
      top: "-6px",
    },
    [theme.breakpoints.down("md")]: {
      top: "-8px",
    },
  },
  "& .MuiFormLabel-root.Mui-focused": {
    top: "3px",
    [theme.breakpoints.down("xl")]: {
      top: "2px",
    },
  },
  "& .arrowIcon": {
    display: "flex",
    right: "10px",
    position: "absolute",
    alignItems: "center",
    zIndex: "-1",
  },

  "&.error .MuiOutlinedInput-notchedOutline": {
    border: `1px solid ${theme.palette.error.main}`,
  },

  "&.error .arrowIcon path": {
    stroke: theme.palette.error.main,
  },
}));

export default Select;
