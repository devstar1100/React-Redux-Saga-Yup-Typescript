import { ModelParameter } from "./customViews";

export type ScenarioTimeRepresentation = "Ticks" | "Elapsed Seconds";

export type ScenarioActionParameter = Pick<ModelParameter, "parameter-path" | "parameter-value">;

export interface ScenarioAction {
  "scenario-action-id": number;
  "action-key": string;
  "action-type": string;
  "action-time": number;
  "action-enum": string;
  "scenario-time-representation": ScenarioTimeRepresentation;
  "console-message": string;
  "number-of-parameters": string;
  "time-representation-enum": number;
  "tick-number"?: string;
  "elapsed-time"?: string;
  "parameters-list": ScenarioActionParameter[];
}
