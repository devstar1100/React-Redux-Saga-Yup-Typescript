import React from "react";
import { FC } from "react";
import { styled } from "@mui/material/styles";
import { Grid, Typography } from "@mui/material";

import { LogRecord, LogSeverityLevel } from "../../types/simulations";

type IConsoleLine = LogRecord;

const TextErrors = {
  [LogSeverityLevel.unconditional]: "Uncond",
  [LogSeverityLevel.fatal]: "Fatal",
  [LogSeverityLevel.error]: "Error",
  [LogSeverityLevel.warning]: "Warn",
  [LogSeverityLevel.info]: "Info",
  [LogSeverityLevel.debug]: "Debug",
  [LogSeverityLevel.sdsDebug]: "SDebug",
};

const ConsoleLine: FC<IConsoleLine> = (item) => {
  const type: LogSeverityLevel = item["log-severity-level"].toLowerCase() as LogSeverityLevel;
  const typeInfo = type === LogSeverityLevel.info;
  const message = item["log-message"];

  const Line = styled(Grid)(({ theme }) => {
    return {
      ...(type === LogSeverityLevel.info && { background: "none" }),
      display: "flex",
      border: "1px solid transparent",
      padding: "1px 0",
      width: "100%",
      minWidth: "fit-content",
      backgroundColor: theme.palette.status[type]?.bgColor,
      h4: {
        color: theme.palette.status[type]?.main,
        fontFamily: theme.typography.secondaryFont,
        padding: "0 6px",
      },
      ".logStatus": {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: theme.borderRadius.xs,
        backgroundColor: typeInfo ? "transparent" : theme.palette.status[type]?.main,
        color: theme.palette.textColor.dark,
        padding: "0 5px",
        marginLeft: "16px",
        minWidth: "60px!important",
      },
      ".timeRecord": {
        minWidth: "60px",
      },
    };
  });

  return (
    <Line>
      <Typography component="h5" className="logStatus" variant="subtitle1">
        {typeInfo ? "" : TextErrors[type]}
      </Typography>
      <Typography component="h4" variant="body2" whiteSpace="nowrap">
        {message}
      </Typography>
    </Line>
  );
};

export default React.memo(ConsoleLine, (prev, next) => {
  if (prev["log-message"] !== next["log-message"]) return false;
  if (prev["log-record-index"] !== next["log-record-index"]) return false;
  if (prev["log-record-simulation-elapsed-time-seconds"] !== next["log-record-simulation-elapsed-time-seconds"])
    return false;
  if (prev["log-severity-level"] !== next["log-severity-level"]) return false;

  return true;
});
