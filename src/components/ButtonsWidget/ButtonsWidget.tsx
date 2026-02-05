import React from "react";
import { Grid, styled, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";

import Button from "../Button/Button";
import {
  ButtonActionType,
  DataSetColor,
  DisplayElementButton,
  DisplayElementButtonStatus,
  InternalLayoutType,
} from "../../types/customViews";
import { handleButtonActionServer } from "../../redux/actions/customViewActions";
import Container, { DisplayElementId } from "../WidgetContainer/WidgetContainer";
import { getIconByType } from "../../lib/getIconByType";
import { getColorByName } from "../../lib/getColorByName";

interface Props {
  elementTitle: string;
  buttons: DisplayElementButton[];
  sessionId: number;
  customViewId: number;
  layout: InternalLayoutType;
}

const ActionButtons = ({
  elementTitle,
  buttons,
  sessionId,
  customViewId,
  layout,
  elementId,
}: Props & DisplayElementId) => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const mappedData = buttons.map((button) => ({
    id: button["button-id"],
    title: button["button-caption"],
    color: button["button-color"],
    icon:
      button["button-icon"] && getIconByType(button["button-icon"]) ? (
        <ButtonIcon src={getIconByType(button["button-icon"])} alt={button["button-icon"]} />
      ) : undefined,
    disabled: button["button-status"] === DisplayElementButtonStatus.disabled,
    onClick: () =>
      dispatch(
        handleButtonActionServer({
          "simulation-session-id": sessionId,
          "custom-view-id": customViewId,
          "button-id": button["button-id"],
          "button-action": ButtonActionType.click,
          "event-enum": button["event-enum"],
          "action-key": button["action-key"],
          "event-target-model": button["event-target-model"],
          "scenario-file-name": button["scenario-file-name"],
        }),
      ),
  }));

  const getCustomButtonColor = (color: DataSetColor) => ({
    backgroundColor: getColorByName(color, theme),
    "& > *": {
      color: color === DataSetColor.white ? `${theme.palette.grey[700]} !important` : DataSetColor.white,
    },
    "&:hover > *": {
      color: `${DataSetColor.white} !important`,
    },
  });

  return (
    <Container title={elementTitle} elementId={elementId}>
      <Wrapper
        width="100%"
        p="16px 0 0"
        container
        flexDirection={layout === InternalLayoutType.vertical ? "column" : "row"}
        gap="16px"
        alignItems="center"
        justifyContent="center"
      >
        {mappedData.map(({ id, title, color, icon, onClick, disabled }) => (
          <Box key={id}>
            <Button sx={getCustomButtonColor(color)} icon={icon} color="green" onClick={onClick} disabled={disabled}>
              {title}
            </Button>
          </Box>
        ))}
      </Wrapper>
    </Container>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  margin: "0 auto",
  [theme.breakpoints.up("xl")]: {
    maxWidth: "85%",
  },
}));

const Box = styled(Grid)(() => ({
  justifyContent: "center",
  button: {
    maxWidth: "none",
    width: "100%",
  },
}));

const ButtonIcon = styled("img")(() => ({
  display: "block",
  width: "16px",
}));

export default React.memo(ActionButtons, (prev, next) => {
  if (prev.elementTitle !== next.elementTitle) return false;
  if (prev.sessionId !== next.sessionId) return false;
  if (prev.customViewId !== next.customViewId) return false;
  if (prev.layout !== next.layout) return false;
  if (JSON.stringify(prev.buttons) !== JSON.stringify(next.buttons)) return false;

  return true;
});
