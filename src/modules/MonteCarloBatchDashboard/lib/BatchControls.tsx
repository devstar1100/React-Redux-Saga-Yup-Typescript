import React, { FC, Fragment, ReactElement, useState } from "react";
import { useDispatch } from "react-redux";
import { Grid, GridProps, styled } from "@mui/material";
import { preventForwardProps } from "../../../lib/preventForwardProps";
import { sendBatchCommandServer } from "../../../redux/actions/MonteCarloBatchActions";
import Container, { DisplayElementId } from "../../../components/WidgetContainer/WidgetContainer";
import ControlLaunchIcon from "../../../components/Icons/ControlLaunchIcon";
import ControlGoIcon from "../../../components/Icons/ControlGoIcon";
import ControlPauseIcon from "../../../components/Icons/ControlPauseIcon";
import ControlTerminateIcon from "../../../components/Icons/ControlTerminateIcon";
import GradientVerticalLine from "../../../components/Lines/GradientVertivalLine";
import GradientHorizontalLine from "../../../components/Lines/GradientHorizontalLine";
import ControlIcon from "../../../components/ControlUnit/ControlUnit";

export interface ISimulationControl {
  batchId: number;
  batchState: string;
  smallVariant?: boolean;
}

const BatchControl: FC<ISimulationControl & DisplayElementId> = ({
  batchState,
  batchId,
  smallVariant,
}): ReactElement => {
  const dispatch = useDispatch();
  const runSessionCommand = (command: string) => {
    dispatch(sendBatchCommandServer({ command, batchId }));
  };

  const [pause, setPause] = useState(
    batchState === "Running" ||
      batchState === "Sleeping" ||
      batchState === "Ready for next run" ||
      batchState === "Finished"
      ? true
      : false,
  );
  const controlIcons = [
    {
      title: "Launch",
      icon: <ControlLaunchIcon />,
      onClick: () => {
        runSessionCommand("run"), setPause(true);
      },
      active: ["Finished", "Stopped", "Undefined"].includes(batchState),
    },
    pause
      ? {
          title: "Pause",
          icon: <ControlPauseIcon />,
          onClick: () => {
            runSessionCommand("pause"), setPause(false);
          },
          active: ["Ready for next run", "Running", "Sleeping"].includes(batchState),
        }
      : {
          title: "Resume",
          icon: <ControlGoIcon />,
          onClick: () => {
            runSessionCommand("run"), setPause(true);
          },
          active: ["Paused"].includes(batchState),
        },
    {
      title: "Terminate",
      icon: <ControlTerminateIcon />,
      onClick: () => runSessionCommand("terminate"),
      active: ["Ready for next run", "Running", "Sleeping", "Paused"].includes(batchState),
    },
  ];

  return (
    <Container title="Batch Execution Control " elementId={batchId}>
      <Wrapper container smallVariant={smallVariant}>
        <ItemContainer container width="auto" wrap="nowrap" smallVariant={smallVariant}>
          {controlIcons.map((item) => (
            <Fragment key={item.title}>
              <ControlIcon {...item} smallVariant={smallVariant} />
              <GradientVerticalLine />
            </Fragment>
          ))}
        </ItemContainer>
        <GradientHorizontalLine />
      </Wrapper>
    </Container>
  );
};

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

export default React.memo(BatchControl, (prev, next) => {
  if (prev.smallVariant !== next.smallVariant) {
    return false;
  }
  if (prev.batchState !== next.batchState) {
    return false;
  }
  if (prev.batchId !== next.batchId) {
    return false;
  }
  return true;
});
