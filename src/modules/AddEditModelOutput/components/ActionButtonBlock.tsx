import { Grid, styled } from "@mui/material";
import Button from "../../../components/Button/Button";

interface Props {
  onConfirm: () => void;
  onDecline: () => void;
  confirmBtnText?: string;
  declineBtnText?: string;
}

const SimulatedModelActionButtonsBlock = ({
  onConfirm,
  onDecline,
  declineBtnText = "Cancel",
  confirmBtnText = "Confirm",
}: Props) => (
  <Wrapper container>
    <Grid container justifyContent="flex-end" gap="12px">
      <Button size="small" color="transparent" onClick={onDecline}>
        {declineBtnText}
      </Button>
      <Button size="small" color="blue" onClick={onConfirm}>
        {confirmBtnText}
      </Button>
    </Grid>
  </Wrapper>
);

const Wrapper = styled(Grid)(({ theme }) => ({
  padding: "16px 24px",
  boxShadow: "0px -4px 4px rgba(93, 79, 79, 0.05)",
  button: {
    padding: "11px 32px",
    width: "fit-content",
    minWidth: "unset",
    p: {
      color: theme.palette.white,
    },
  },
  "button:first-of-type": {
    padding: "11px 16px",
  },
  "@media(max-width: 1200px)": {
    "button:first-of-type": {
      padding: "8px 9px",
    },
    button: {
      padding: "8px 16px",
    },
  },
}));

export default SimulatedModelActionButtonsBlock;
