import ControlLaunchIcon from "../Icons/ControlLaunchIcon";
import ControlPauseIcon from "../Icons/ControlPauseIcon";
import ControlStepIcon from "../Icons/ControlStepIcon";
import ControlTerminateIcon from "../Icons/ControlTerminateIcon";
import ControlAbortIcon from "../Icons/ControlAbortIcon";
import Container, { DisplayElementId } from "../WidgetContainer";
import ControlIcon from "../ControlUnit";
import { Grid, Slider, styled, Typography } from "@mui/material";
import { FC, Fragment, ReactElement, useEffect, useState } from "react";
import { GridProps } from "@mui/material/Grid/Grid";
import { preventForwardProps } from "../../lib/preventForwardProps";
import GradientVerticalLine from "../Lines/GradientVertivalLine";
import Button from "../Button";
import SetSpeedIcon from "../Icons/SetSpeedIcon";
import IconClock from "../Icons/IconClock";
import ButtonLightningIcon from "../Icons/ButtonLightningIcon";
import GradientHorizontalLine from "../Lines/GradientHorizontalLine";
import { SessionStatus, SimulationRunMode, SimulationSessionActionType } from "../../types/simulations";
import useSimulationRunMode from "../../hooks/useSimulationRunMode";
import { useDispatch, useSelector } from "react-redux";
import { launchSimulationSessionServer, runSimulationSessionActionServer } from "../../redux/actions/simulationActions";
import WidgetLoader from "../WidgetLoader";
import { getSessionInformation, getSimulationLoadingStates } from "../../redux/reducers/simulationReducer";
import { pages } from "../../lib/routeUtils";
import { useLocation, useNavigate } from "react-router";
import React from "react";
import ControlGoIcon from "../Icons/ControlGoIcon";

export interface ISimulationControl {
  simulationId: number;
  speed: number;
  sessionStatus: SessionStatus;
  runMode: SimulationRunMode;
  sessionId?: number;
  smallVariant?: boolean;
}

type ISimulationSpeed = ISimulationControl;

const hiddenControlsButtons = {
  [SessionStatus.uninitialized]: ["Pause"],
  [SessionStatus.initializing]: ["Pause"],
  [SessionStatus.initialized]: ["Pause"],
  [SessionStatus.running]: ["Go"],
  [SessionStatus.paused]: ["Pause"],
  [SessionStatus.failedToLaunch]: ["Go"],
  [SessionStatus.terminated]: ["Go"],
  [SessionStatus.crashed]: ["Go"],
};

//! these props are hardcoded into manual rerender control below, be aware!
const SimulationControl: FC<ISimulationControl & DisplayElementId> = ({
  smallVariant,
  speed,
  runMode,
  sessionId,
  sessionStatus,
  simulationId,
  elementId,
}): ReactElement => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isSessionActionLoading } = useSelector(getSimulationLoadingStates) || {};

  const launchSession = () =>
    dispatch(
      launchSimulationSessionServer({
        "simulation-id": simulationId,
        redirect:
          `/${pathname.split("/")[1]}` === pages.simulationDashboard()
            ? (subroute?: string) => navigate(`${pages.simulationDashboard()}/${simulationId}${subroute || ""}`)
            : undefined,
      }),
    );

  const runSessionCommand = (command: SimulationSessionActionType) => {
    if (sessionId)
      dispatch(
        runSimulationSessionActionServer({
          "simulation-session-id": sessionId,
          "action-type": command,
        }),
      );
  };

  const controlIcons = [
    {
      title: "Launch",
      icon: <ControlLaunchIcon />,
      onClick: launchSession,
      active: sessionStatus === SessionStatus.uninitialized,
    },
    {
      title: "Go",
      icon: <ControlGoIcon />,
      onClick: () => runSessionCommand(SimulationSessionActionType.run),
      active: [SessionStatus.initialized, SessionStatus.paused].includes(sessionStatus),
    },
    {
      title: "Pause",
      icon: <ControlPauseIcon />,
      onClick: () => runSessionCommand(SimulationSessionActionType.pause),
      active: sessionStatus === SessionStatus.running,
    },
    {
      title: "Step",
      icon: <ControlStepIcon />,
      onClick: () => runSessionCommand(SimulationSessionActionType.step),
      active: [SessionStatus.initialized, SessionStatus.paused].includes(sessionStatus),
    },
    {
      title: "Terminate",
      icon: <ControlTerminateIcon />,
      onClick: () => runSessionCommand(SimulationSessionActionType.terminate),
      active: [
        SessionStatus.initialized,
        SessionStatus.initializing,
        SessionStatus.running,
        SessionStatus.paused,
      ].includes(sessionStatus),
    },
    {
      title: "Abort",
      icon: <ControlAbortIcon />,
      onClick: () => runSessionCommand(SimulationSessionActionType.abort),
      active: [
        SessionStatus.uninitialized,
        SessionStatus.initializing,
        SessionStatus.initialized,
        SessionStatus.running,
        SessionStatus.paused,
        SessionStatus.failedToLaunch,
        SessionStatus.crashed,
      ].includes(sessionStatus),
    },
  ];

  return (
    <Container title="Simulation Control" elementId={elementId}>
      <Wrapper container smallVariant={smallVariant}>
        <ItemContainer container width="auto" wrap="nowrap" smallVariant={smallVariant}>
          {controlIcons
            .filter((item) => !hiddenControlsButtons[sessionStatus].includes(item.title))
            .map((item) => (
              <Fragment key={item.title}>
                <ControlIcon {...item} smallVariant={smallVariant} />
                <GradientVerticalLine />
              </Fragment>
            ))}
        </ItemContainer>
        <GradientHorizontalLine />
        <SimulationSpeed
          simulationId={simulationId}
          smallVariant={smallVariant}
          speed={speed}
          runMode={runMode}
          sessionId={sessionId}
        />
        {isSessionActionLoading && <WidgetLoader />}
      </Wrapper>
    </Container>
  );
};

const SimulationSpeed: FC<Omit<ISimulationSpeed, "sessionStatus">> = ({ smallVariant, speed, runMode, sessionId }) => {
  const { setAsFastAsPossible, setRealTimeSpeed, setSpecificSpeed } = useSimulationRunMode(sessionId);
  const [customSpeed, setCustomSpeed] = useState<number>(0.1);
  const session = useSelector(getSessionInformation);

  const handleSpeedChange = (event: any) => {
    setCustomSpeed(+event.target.value);
  };

  const handleSliderKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (event.code === "ArrowRight") setCustomSpeed((prev) => parseFloat((prev + 0.1).toFixed(1)));
    if (event.code === "ArrowLeft") setCustomSpeed((prev) => parseFloat((prev - 0.1).toFixed(1)));
  };

  const handleSliderKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (["ArrowRight", "ArrowLeft"].includes(event.code)) sendSelectedSpeed();
  };

  const sendSelectedSpeed = () => setSpecificSpeed(customSpeed);

  useEffect(() => {
    setCustomSpeed(+speed);
  }, [speed]);

  return (
    <Box container flexDirection="column" width="auto" gap="12px" smallVariant={smallVariant}>
      <Typography
        component="span"
        width="fit-content"
        variant={smallVariant ? "subtitle1" : "body2"}
        color={smallVariant ? "textColor.main" : "textColor.light"}
        fontWeight={smallVariant ? 700 : 400}
      >
        Current Simulation Speed:
        <Typography
          pl={smallVariant ? "1px" : "10px"}
          component="span"
          variant={smallVariant ? "subtitle1" : "body2"}
          color={smallVariant ? "textColor.main" : "textColor.light"}
          fontFamily="secondaryFont"
          fontWeight={smallVariant ? 700 : 400}
        >
          x {speed}
        </Typography>
      </Typography>
      <ActionWrapper
        container
        width="auto"
        flexWrap="nowrap"
        gap="12px"
        height="fit-content"
        smallVariant={smallVariant}
      >
        <CustomSpeedButton>
          <Button
            icon={<SetSpeedIcon />}
            color={runMode === SimulationRunMode.specificSpeed ? "green" : "gray"}
            size="small"
            additionalSmallVariant={smallVariant}
          >
            Set Speed
          </Button>
        </CustomSpeedButton>
        {!!sessionId && session?.["simulation-session-status"] !== SessionStatus.uninitialized && (
          <SliderWrapper>
            <Box display="flex" justifyContent="space-between" padding="0 !important" marginBottom="5px">
              <Typography
                component="span"
                width="fit-content"
                variant={"body2"}
                color={"textColor.light"}
                fontWeight={400}
              >
                0.1
              </Typography>
              <Typography
                component="span"
                width="fit-content"
                variant={"body2"}
                color={"textColor.light"}
                fontWeight={400}
              >
                100
              </Typography>
            </Box>
            <Slider
              size="small"
              defaultValue={0}
              aria-label="Small"
              valueLabelDisplay="auto"
              min={0.1}
              max={100.0}
              step={0.1}
              value={customSpeed}
              onChange={handleSpeedChange}
              onChangeCommitted={sendSelectedSpeed}
              onKeyDown={handleSliderKeyDown}
              onKeyUp={handleSliderKeyUp}
            />
          </SliderWrapper>
        )}
        <Button
          icon={<IconClock active={runMode === SimulationRunMode.realTime} />}
          color={runMode === SimulationRunMode.realTime ? "green" : "gray"}
          size="small"
          additionalSmallVariant={smallVariant}
          onClick={setRealTimeSpeed}
        >
          Real Time
        </Button>
        <Button
          icon={<ButtonLightningIcon />}
          color={runMode === SimulationRunMode.asFastAsPossible ? "green" : "gray"}
          additionalSmallVariant={smallVariant}
          onClick={setAsFastAsPossible}
        >
          As fast as possible
        </Button>
      </ActionWrapper>
    </Box>
  );
};

const ActionWrapper = styled<FC<GridProps & { smallVariant?: boolean }>>(
  Grid,
  preventForwardProps(["smallVariant"]),
)(({ theme, smallVariant }) => ({
  position: "relative",
  [theme.breakpoints.up("xl")]: {
    justifyContent: smallVariant ? "end" : "flex-start",
  },
}));
const Box = styled<FC<GridProps & { smallVariant?: boolean }>>(
  Grid,
  preventForwardProps(["smallVariant"]),
)(({ theme, smallVariant }) => ({
  paddingLeft: smallVariant ? 0 : "24px",
  flexWrap: smallVariant ? "nowrap" : "wrap",
  [theme.breakpoints.down(1420)]: {
    flexWrap: "wrap",
    paddingLeft: 0,
  },
}));

const ItemContainer = styled<FC<GridProps & { smallVariant?: boolean }>>(
  Grid,
  preventForwardProps(["smallVariant"]),
)(({ theme, smallVariant }) => ({
  padding: smallVariant ? "0 28px" : 0,
  gap: "25px",
  justifyContent: smallVariant ? "space-between" : "flex-start",
  "& .gradientVerticalLine:last-of-type": {
    display: smallVariant ? "none" : "block",
    margin: "10px 0",
    [theme.breakpoints.down("lg")]: {
      display: "none",
    },
  },
  [theme.breakpoints.down("xl")]: {
    padding: smallVariant ? "0 20px" : 0,
    gap: "16px",
  },
  [theme.breakpoints.down("lg")]: {
    justifyContent: "space-around",
    gap: "5px",
    padding: 0,
  },
  [theme.breakpoints.up("xl")]: {
    padding: 0,
    maxWidth: "560px",
  },
}));

const Wrapper = styled<FC<GridProps & { smallVariant?: boolean }>>(
  Grid,
  preventForwardProps(["smallVariant"]),
)(({ theme, smallVariant }) => ({
  gap: smallVariant ? "16px" : 0,
  rowGap: "10px",
  flexDirection: smallVariant ? "column" : "row",
  padding: "24px 0 8px",
  width: "auto",
  "& .gradientHorizontalLine": {
    display: smallVariant ? "block" : "none",
  },
  [theme.breakpoints.down("lg")]: {
    padding: "16px 0 8px",
    gap: "16px",
    flexWrap: smallVariant ? "nowrap" : "wrap",
  },
  [theme.breakpoints.up("xl")]: {
    margin: "0 auto",
    alignItems: "center",
    width: "100%",
  },
}));

const SliderWrapper = styled(Box)(({ theme }) => ({
  opacity: 0,
  visibility: "hidden",
  transition: "opacity 0.3s, visibility 0.3s",
  position: "absolute",
  left: "0",
  top: "calc(100% + 20px)",
  width: "300px",
  zIndex: 10,
  padding: "21px 24px 9px",
  borderRadius: "8px",
  backgroundColor: theme.palette.additional[800],
  border: `1px solid ${theme.palette.additional[700]}`,

  "& .MuiSlider-root": {
    height: "6px",

    "& .MuiSlider-thumb": {
      width: "20px !important",
      height: "20px !important",
      border: "2px solid #141414",
      boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    },

    "& .MuiSlider-rail": {
      backgroundColor: "#636363",
    },
  },

  "&:hover": {
    opacity: 1,
    visibility: "visible",
  },
}));

const CustomSpeedButton = styled("div")(() => ({
  "&:hover + *": {
    opacity: 1,
    visibility: "visible",
  },
}));

export default React.memo(SimulationControl, (prev, next) => {
  if (prev.smallVariant !== next.smallVariant) {
    return false;
  }
  if (prev.speed !== next.speed) {
    return false;
  }
  if (prev.runMode !== next.runMode) {
    return false;
  }
  if (prev.sessionId !== next.sessionId) {
    return false;
  }
  if (prev.sessionStatus !== next.sessionStatus) {
    return false;
  }
  if (prev.simulationId !== next.simulationId) {
    return false;
  }
  return true;
});
