import { ScenarioFile } from "../../../types/scenarioFile";

export const editScenarioInitialState: ScenarioFile = {
  "scenario-file-id": 0,
  "scenario-file-name": "",
  "simulation-name": "",
  "simulation-owner-name": "",
  "total-number-of-events": "0",
  "total-number-of-lines": "0",
  "scenario-file-folder": "", // Added property
  "creation-date": "",
  "last-update-date": "",
  "time-representation": "Ticks",
};

export const editScenarioInitialErrorsState: Record<keyof ScenarioFile, string> = {
  "scenario-file-name": "",
  "scenario-file-id": "",
  "simulation-name": "",
  "simulation-owner-name": "",
  "total-number-of-events": "",
  "total-number-of-lines": "",
  "scenario-file-folder": "", // Added property
  "creation-date": "",
  "last-update-date": "",
  "time-representation": "Ticks",
};
