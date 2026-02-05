import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import MUISelect from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { Grid, SelectChangeEvent, Typography, useTheme } from "@mui/material";
import { styled } from "@mui/material/styles";
import { CollapseArrowUp } from "../Icons/CollapseArrowUp";
import { CollapseArrowDown } from "../Icons/CollapseArrowDown";
import { FC, ReactElement, useState } from "react";

interface ISelect {
  options: string[];
  excludeOptions?: string[];
  value: string[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  onChange: (newValue: string[]) => void;
}

const MultiSelect: FC<ISelect> = ({
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

  const handleChange = (event: SelectChangeEvent<typeof value>) => {
    onChange(event.target.value as string[]);
  };

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Form className={`customSelect ${error && "error"}`}>
      <MUISelect
        IconComponent={() => <Grid className="arrowIcon">{open ? <CollapseArrowUp /> : <CollapseArrowDown />}</Grid>}
        id="select"
        open={open}
        onClose={handleClick}
        onOpen={handleClick}
        value={value}
        disabled={disabled}
        multiple
        displayEmpty
        renderValue={(selected) =>
          selected && selected.length > 0 ? (
            <Typography variant="subtitle1" color="textColor.lightWhite" pr="11px">
              {`${selected[0]}${selected.length > 1 ? ",..." : ""}`}
            </Typography>
          ) : (
            <Typography variant="subtitle1" color="textColor.lightWhite" pr="11px">
              {placeholder}
            </Typography>
          )
        }
        inputProps={{ "aria-label": "Without label" }}
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            style: {
              backgroundColor: theme.palette.additional[700],
              borderRadius: "10px",
              padding: "2px 10px 10px",
              marginTop: "10px",
              maxHeight: "400px",
            },
          },
        }}
      >
        {options
          .filter((el) => !excludeOptions.includes(el))
          .map((item) => (
            <Item key={item} value={item}>
              <Checkbox
                checked={value.includes(item)}
                sx={{
                  color: "white !important",
                  "&.Mui-checked": {
                    color: "#003D8C !important",
                  },
                }}
              />
              <Typography variant="subtitle1">{item}</Typography>
            </Item>
          ))}
      </MUISelect>
    </Form>
  );
};

const Item = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.textColor.lightWhite,
  border: "1px solid transparent !important",
  marginTop: "3px",
  padding: 0,
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
  maxWidth: "220px",
  minWidth: "200px",
  position: "relative",
  borderRadius: theme.borderRadius.xs,
  backgroundColor: theme.palette.additional[700],
  zIndex: 0,

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 12px",
    color: theme.palette.textColor.lightWhite,
    borderRadius: theme.borderRadius.xs,
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

export default MultiSelect;
