import React, { ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { getModifyParameterPopupState, getPopupPrefilledInfo } from "../../redux/reducers/popupsReducer";
import SmallModalWrapper, { SmallModalType } from "../SmallModalWrapper";
import { useDispatch } from "react-redux";
import { updatePopup } from "../../redux/actions/popupsActions";
import { Popups } from "../../types/popups";
import { Grid, Typography, styled } from "@mui/material";
import Button from "../Button";
import NumericFormat from "../NumericFormat";
import Input from "../Inputs";
import { setScenarioParameterServer } from "../../redux/actions/simulationActions";

export interface ModifyParamPopupProps {
  "simulation-session-id": number;
  "parameter-path": string;
}

const ModifyParameterPopup = () => {
  const dispatch = useDispatch();
  const isActive = useSelector(getModifyParameterPopupState);
  const prefilled = useSelector(getPopupPrefilledInfo) as ModifyParamPopupProps;

  const [value, setValue] = useState<string>("");

  const handleClose = () => {
    setValue("");
    dispatch(updatePopup({ popup: Popups.modifyParameter, status: false }));
  };

  const submitForm = () => {
    dispatch(
      setScenarioParameterServer({
        "simulation-session-id": prefilled["simulation-session-id"],
        "parameter-path": prefilled["parameter-path"],
        "parameter-value": value,
      }),
    );
  };

  return (
    <SmallModalWrapper
      variant={SmallModalType.fullScreen}
      isActive={isActive}
      onClose={handleClose}
      additionalStyles={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
    >
      <Content>
        <Typography component="h6" variant="h6" fontSize="16px" lineHeight="140%" color="grey.50">
          Modify selected parameter
        </Typography>
        <Typography
          component="h6"
          variant="subtitle1"
          color="grey.100"
          sx={{ marginBottom: "10px", wordBreak: "break-word" }}
        >
          Modify {prefilled?.["parameter-path"]}
        </Typography>
        <Input
          fullWidth
          placeholder={"New value"}
          value={value}
          handleChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
        />
        <ButtonsRow>
          <Button size="small" onClick={handleClose}>
            Cancel
          </Button>
          <Button size="small" color="blue" onClick={() => (submitForm(), handleClose())}>
            Confirm
          </Button>
        </ButtonsRow>
      </Content>
    </SmallModalWrapper>
  );
};

const Content = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
  rowGap: "15px",
  padding: "5px 16px",
  maxWidth: "296px",
}));

const ButtonsRow = styled(Grid)(() => ({
  display: "flex",
  columnGap: "4px",
  paddingTop: "8px",

  "& > *": {
    flex: 1,
  },
}));

export default ModifyParameterPopup;
