import { ScenarioFileDto } from "../../../redux/actions/scenarioFilesActions";
import { ScenarioFile } from "../../../types/scenarioFile";

export const manageScenarioFileDto = (
  file: ScenarioFile,
  simulationId: number,
  timeRepresentationEnum: number,
): ScenarioFileDto => {
  return {
    "scenario-file-id": file["scenario-file-id"] || 0,
    "scenario-file-name": file["scenario-file-name"],
    "simulation-id": simulationId,
    "time-representation": timeRepresentationEnum,
  };
};
