import { FC, Dispatch } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { styled, Checkbox as MuiCheckbox } from "@mui/material";
import FilterIcon from "../Icons/FilterIcon";
import CheckIcon from "../Icons/CheckIcon";

export interface Value {
  text: string;
  value: string | boolean | number;
}

interface Variant {
  values: Value[];
}

interface Props {
  text: string;
  filters: string[];
  variants: Variant;
  setFilters: Dispatch<any>;
  handleChangeFilter?: () => void;
  multiple?: boolean;
}

const MultipleSelectCheckmarks: FC<Props> = ({
  text,
  filters,
  variants,
  setFilters,
  handleChangeFilter,
  multiple = true,
}) => {
  const variantName = [text, ...filters];

  const handleChange = (e: any) => {
    const value = e.target.value;

    if (handleChangeFilter) handleChangeFilter();

    if (multiple) {
      if (value.length < variantName.length) {
        setFilters((prev: any) => ({
          ...prev,
          filters: value
            .slice(1, value.length)
            .map((valueItem: string) => variants.values.find((variant) => variant.text === valueItem)?.text),
        }));
        return;
      }

      const newFilters = Array.from(new Set([...variantName, ...value]));

      setFilters((prev: any) => ({
        ...prev,
        filters: newFilters
          .slice(1, newFilters.length)
          .map((valueItem: string) => variants.values.find((variant) => variant.text === valueItem)?.text),
      }));
    } else {
      setFilters((prev: any) => ({
        ...prev,
        filters: [value],
      }));
    }
  };

  return (
    <Form className={filters.length ? "hasSelectedItems" : ""}>
      <FormControl>
        <Select
          IconComponent={() => <></>}
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple={multiple}
          value={variantName}
          onChange={handleChange}
          renderValue={(values) => (
            <Wrapper>
              <FilterIcon />
              {values[0]}
            </Wrapper>
          )}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left",
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left",
            },
            PaperProps: {
              style: {
                backgroundColor: "#141414",
                padding: "12px 16px",
                width: "200",
              },
            },
          }}
        >
          {variants.values.map((variant) => (
            <Item key={variant.text} value={variant.text}>
              <CustomCheckbox
                checkedIcon={
                  <CustomChecked>
                    <CheckIcon />
                  </CustomChecked>
                }
                checked={variantName.findIndex((item) => item === variant.text) >= 0}
              />
              <ListItemText primary={variant.text} />
            </Item>
          ))}
        </Select>
      </FormControl>
    </Form>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: theme.typography.subtitle1.fontSize,
}));

const Item = styled(MenuItem)(({ theme }) => ({
  color: theme.palette.textColor.lightWhite,
  border: "1px solid transparent !important",
  marginTop: "4px",
  padding: 0,
  height: "34px",
  paddingRight: "13px",

  "&.Mui-selected": {
    backgroundColor: `${theme.palette.additional[700]} !important`,
    borderRadius: `${theme.borderRadius.xs} !important`,
  },

  "&:hover": {
    border: `1px solid ${theme.palette.additional[600]} !important`,
    borderRadius: `${theme.borderRadius.xs} !important`,
  },
}));

const Form = styled(FormControl)(({ theme }) => ({
  position: "relative",
  borderRadius: theme.borderRadius.xs,
  background: theme.palette.additional[700],
  zIndex: 0,

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "9px 12px !important",
    color: theme.palette.main[50],
    borderRadius: "0 !important",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    border: `1px solid ${theme.palette.additional[700]} !important`,
  },

  "& .MuiPaper-root": {
    backgroundColor: `${theme.palette.main[600]} !important`,
  },

  "&.hasSelectedItems .MuiInputBase-root": {
    background: theme.palette.main[50],

    "& *": {
      color: theme.palette.grey[500],

      "& svg > path": {
        fill: theme.palette.grey[500],
      },
    },
  },

  "& .MuiInputBase-root:has(.MuiSelect-select[aria-expanded='true']), &.hasSelectedItems .MuiInputBase-root": {
    background: theme.palette.main[50],

    "& .MuiSelect-select": {
      color: `${theme.palette.additional[700]}`,
    },

    "& path": {
      fill: theme.palette.additional[700],
    },
  },
}));

const CustomCheckbox = styled(MuiCheckbox)(({ theme }) => ({
  "& .MuiSvgIcon-root": {
    fill: theme.palette.main[100],
    width: "14px",
    position: "relative",
    "&[data-testid='CheckBoxIcon']": {
      fill: "#003D8C",
    },
  },
}));

const CustomChecked = styled("div")(({ theme }) => ({
  width: "11px",
  height: "11px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#003D8C",
  borderRadius: "2px",
  marginLeft: "1px",
  marginRight: "2px",
}));

export default MultipleSelectCheckmarks;
