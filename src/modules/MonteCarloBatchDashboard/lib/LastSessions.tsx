import React from "react";
import BasicTable from "../../../components/Tables/BasicTable";
import { MonteCarloBatch } from "../../../types/monteCarloBatches";

interface Props {
  data: MonteCarloBatch;
}

const LastSessions = ({ data }: Props) => {
  const mappedData = data["simulation-sessions-list-last-n"].map((item, index) => ({
    id: index,
    list: [item["session-id"], item["current-state"], item["run-start-time"], item["run-last-update-time"]],
  }));

  return <BasicTable headers={["Session ID", "State", "Start Time", "Last Update Time"]} rows={mappedData} />;
};

export default React.memo(LastSessions, (prev, next) => {
  if (JSON.stringify(prev.data) !== JSON.stringify(next.data)) {
    return false;
  }
  return true;
});
