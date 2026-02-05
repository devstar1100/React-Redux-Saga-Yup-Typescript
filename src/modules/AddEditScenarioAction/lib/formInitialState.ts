import { ScenarioAction } from "../../../types/scenarioAction";

export const editScenarioInitialState: ScenarioAction = {
  "scenario-action-id": 0,
  "action-key": "",
  "action-type": "",
  "action-time": 0,
  "action-enum": "",
  "scenario-time-representation": "Ticks",
  "console-message": "",
  "number-of-parameters": "",
  "tick-number": "",
  "elapsed-time": "",
  "time-representation-enum": 0,
  "parameters-list": [],
};

export const editScenarioInitialErrorsState: Record<keyof ScenarioAction, string> = {
  "scenario-action-id": "",
  "action-key": "",
  "action-type": "",
  "action-time": "",
  "action-enum": "",
  "scenario-time-representation": "",
  "console-message": "",
  "number-of-parameters": "",
  "tick-number": "",
  "elapsed-time": "",
  "time-representation-enum": "",
  "parameters-list": "",
};
