import { Grid, Typography } from "@mui/material";
import Container, { DisplayElementId } from "../WidgetContainer/WidgetContainer";
import Select from "../Select";
import { LogRecord, LogSeverityLevel } from "../../types/simulations";
import { FC, ReactElement, useRef, useState } from "react";
import ConsoleLine from "./ConsoleLine";
import { styled } from "@mui/material/styles";
import InputSearch from "../Inputs/InputSearch";
import { searchMatch } from "../../lib/searchMatch";
import { ViewportList } from "react-viewport-list";
import ScrollToBottom from "react-scroll-to-bottom";

interface IConsole {
  logs?: LogRecord[];
}

const defaultSeverityLevel = "Show all log levels";
type SeverityLevelSelect = LogSeverityLevel | typeof defaultSeverityLevel;

const Console: FC<IConsole & DisplayElementId> = ({ logs, elementId }): ReactElement => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [severityLevel, setSeverityLevel] = useState<SeverityLevelSelect>(defaultSeverityLevel);

  const ref = useRef<HTMLDivElement | null>(null);

  const filteredLogs = (logs || []).filter(
    (item) =>
      searchMatch(item["log-message"], searchQuery) &&
      (item["log-severity-level"].toLowerCase() === severityLevel ||
        (!item["log-severity-level"] && severityLevel === LogSeverityLevel.unconditional) ||
        severityLevel === defaultSeverityLevel),
  );

  return (
    <Container
      title="Simulator Controller Log"
      elementId={elementId}
      headingAction={
        <Heading
          searchQuery={searchQuery}
          severityLevel={severityLevel}
          setSearchQuery={setSearchQuery}
          setSeverityLevel={setSeverityLevel}
        />
      }
    >
      <LineWrapper id="console_scrollable_block" mt="12px" ref={ref}>
        <ScrollToBottom checkInterval={80}>
          {!filteredLogs.length ? (
            <Typography
              variant="h6"
              component="h5"
              color="textColor.light"
              margin="auto"
              justifyContent="center"
              display="flex"
              alignItems="center"
              height="100%"
              padding={"30px 0"}
            >
              {!searchQuery ? "No logs yet" : "No logs found"}
            </Typography>
          ) : (
            <ViewportList viewportRef={ref} items={filteredLogs}>
              {(item) => <ConsoleLine {...item} key={item["log-record-index"] + "log-item-das"} />}
            </ViewportList>
          )}
        </ScrollToBottom>
      </LineWrapper>
    </Container>
  );
};

const LineWrapper = styled(Grid)({
  "& > *": {
    width: "100%",
    height: "400px",
  },
});

interface HeadingProps {
  searchQuery: string;
  severityLevel: SeverityLevelSelect;
  setSearchQuery: (value: string) => void;
  setSeverityLevel: (value: SeverityLevelSelect) => void;
}

const Heading = ({ searchQuery, setSearchQuery, severityLevel, setSeverityLevel }: HeadingProps) => {
  return (
    <Grid container gap="12px" width="fit-content">
      <Select
        options={[
          defaultSeverityLevel,
          LogSeverityLevel.info,
          LogSeverityLevel.warning,
          LogSeverityLevel.error,
          LogSeverityLevel.fatal,
        ]}
        value={severityLevel}
        onChange={(value: string) => setSeverityLevel(value as SeverityLevelSelect)}
      />
      <InputSearch value={searchQuery} onChange={setSearchQuery} />
    </Grid>
  );
};
export default Console;
