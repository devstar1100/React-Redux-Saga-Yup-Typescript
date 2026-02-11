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

interface IObjectSelect {
  options: any[];
  excludeOptions?: string[];
  value: number | string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  onChange: (newValue: any) => void;
}

const Select: FC<IObjectSelect> = ({
  options,
  value,
  placeholder,
  disabled,
  onChange,
  error,
  excludeOptions,
}): ReactElement => {
  const newOptions =
    typeof options[0] === "object" ? options : options.map((option) => ({ value: option, item: option }));
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
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
        value={String(value)}
        disabled={disabled}
        displayEmpty
        renderValue={(value) =>
          value !== undefined ? (
            <Typography variant="subtitle1" color="textColor.lightWhite" pr="11px">
              {newOptions.find((item) => String(item["value"]) === value)?.["item"]}
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
              maxHeight: "200px",
            },
          },
        }}
      >
        {newOptions
          .filter((el) => !(excludeOptions ?? []).includes(el))
          .map((e, index) =>
            e === undefined ? (
              <Item value={""} key={index}>
                <Typography variant="subtitle1">{e}</Typography>
              </Item>
            ) : (
              <Item value={e.value} key={index}>
                <Typography variant="subtitle1">{e.item}</Typography>
              </Item>
            ),
          )}
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
