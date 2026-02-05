import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FillCheckbox from "../Icons/FillCheckbox";
import EmptyCheckbox from "../Icons/EmptyCheckbox";
import { styled } from "@mui/material";

interface Props {
  isChecked: boolean;
  onChange: (nextValue: boolean) => void;
  formikName?: string;
}

const CustomCheckbox = ({ isChecked, onChange, formikName }: Props) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <Wrapper
      icon={<EmptyCheckbox />}
      checkedIcon={<FillCheckbox />}
      disableRipple
      checked={isChecked}
      onChange={handleChange}
      name={formikName}
    />
  );
};

const Wrapper = styled(Checkbox)({
  padding: 0,
});

export default CustomCheckbox;
