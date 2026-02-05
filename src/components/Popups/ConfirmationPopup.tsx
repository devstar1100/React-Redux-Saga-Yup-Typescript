import { Grid, Typography, styled } from "@mui/material";
import { useSelector } from "react-redux";

import SmallModalWrapper, { SmallModalType } from "../SmallModalWrapper/SmallModalWrapper";
import Button, { CustomButtonProps } from "../Button/Button";
import { getConfirmationPopupState, getPopupPrefilledInfo } from "../../redux/reducers/popupsReducer";
import { useDispatch } from "react-redux";
import { updatePopup } from "../../redux/actions/popupsActions";
import { Popups } from "../../types/popups";

export interface ConfirmationPopupProps {
  title: string;
  message: string;
  confirmBtnText?: string;
  declineBtnText?: string;
  confirmBtnColor?: Pick<CustomButtonProps, "color">["color"];
  onConfirm: () => void;
  onDecline?: () => void;
}

const ConfirmationPopup = () => {
  const dispatch = useDispatch();
  const isActive = useSelector(getConfirmationPopupState);

  const prefilled = useSelector(getPopupPrefilledInfo);

  const {
    title,
    message,
    confirmBtnText = "Confirm",
    declineBtnText = "Decline",
    confirmBtnColor = "blue",
    onConfirm,
    onDecline,
  } = (prefilled as ConfirmationPopupProps) || {};

  const handleClose = () => dispatch(updatePopup({ popup: Popups.confirmation, status: false }));

  return (
    <SmallModalWrapper
      variant={SmallModalType.fullScreen}
      additionalStyles={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
      isActive={isActive}
      onClose={handleClose}
    >
      <Content>
        <Typography component="h6" variant="h6" fontSize="16px" lineHeight="140%" color="grey.50">
          {title}
        </Typography>
        <Typography component="h6" variant="subtitle1" color="grey.100">
          {message}
        </Typography>
        <ButtonsRow>
          <Button size="small" onClick={() => (onDecline?.(), handleClose())}>
            {declineBtnText}
          </Button>
          <Button size="small" color={confirmBtnColor} onClick={() => (onConfirm(), handleClose())}>
            {confirmBtnText}
          </Button>
        </ButtonsRow>
      </Content>
    </SmallModalWrapper>
  );
};

const Content = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "column",
  rowGap: "10px",
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

export default ConfirmationPopup;
