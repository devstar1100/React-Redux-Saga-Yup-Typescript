import { ScenarioActionDto } from "../../../redux/actions/scenarioListActions";
import { ScenarioAction, ScenarioActionParameter } from "../../../types/scenarioAction";

interface Props {
  file: ScenarioAction;
  actionTypeEnumId?: number;
  scenarioRepresentationEnumId?: number;
  parameters: ScenarioActionParameter[];
}

export const manageScenarioActionDto = ({
  file,
  actionTypeEnumId,
  scenarioRepresentationEnumId,
  parameters,
}: Props): ScenarioActionDto => {
  return {
    "action-type-enum": actionTypeEnumId || 0,
    "action-type": file["action-type"],
    "action-enum": file["action-enum"],
    "action-time": scenarioRepresentationEnumId === 1 ? Number(file["tick-number"]) : Number(file["elapsed-time"]),
    "time-representation-enum": scenarioRepresentationEnumId || 0,
    "console-message": file["console-message"],
    "number-of-parameters": parameters.length,
    "parameters-list": parameters.map((param) => ({
      "parameter-path": param["parameter-path"],
      "parameter-value": param["parameter-value"],
    })),
  };
};
