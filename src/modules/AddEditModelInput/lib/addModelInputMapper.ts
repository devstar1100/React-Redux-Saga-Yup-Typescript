import { AddModelInputsServerProps } from "../../../redux/actions/modelInputsActions";
import { SimulatedModel } from "../../../types/SimulatedModel";
import { IModelOutput } from "../../../types/modelOutput";
import { SimulationEnumType } from "../../../types/simulations";
import { modelInputInitialState } from "./addEditModelInputSchema";
import { transformInputAlias } from "./transformInputAlias";

interface Props {
  formData: typeof modelInputInitialState;
  modelOutputs: IModelOutput[];
  dataExchangeCriteria: SimulationEnumType;
  simulatedModels: SimulatedModel[];
  inputRules: SimulationEnumType;
  messageTypes: SimulationEnumType;
}

const findModelOutput = <T>(list: T[], key: keyof T, value: T[keyof T]) => {
  return list.find((el) => el[key] === value);
};

const getEnumValueId = (simulationEnum: SimulationEnumType, value: string) => {
  const id = simulationEnum?.["enum-values"].find((model) => model["enum-value-string"] === value)?.["enum-value-id"];

  return id;
};

export const addModelInputMapper = ({
  formData,
  modelOutputs,
  dataExchangeCriteria,
  simulatedModels,
  inputRules,
  messageTypes,
}: Props): AddModelInputsServerProps => {
  const dataExchangeCriteriaId = getEnumValueId(dataExchangeCriteria, formData.dataExchangeCriteria) || 0;
  const inputRuleId = getEnumValueId(inputRules, formData.inputRule) || 0;

  const sourceModelId = findModelOutput(modelOutputs, "model-full-path", formData.sourceModel)?.["model-id"] || 0;
  const targetModelId = findModelOutput(simulatedModels, "model-full-path", formData.targetModel)?.["model-id"] || 0;

  const modelOutputId = modelOutputs.find((item) => {
    const currentMessageType = messageTypes?.["enum-values"].find((el) => el["enum-value-id"] === item["message-type"]);

    return (
      `${item["output-structure-name"]}[${currentMessageType?.["enum-value-string"] || ""}]` ===
      formData.sourceModelOutput
    );
  })?.["model-output-id"];

  return {
    "source-model-id": sourceModelId,
    "target-model-id": targetModelId,
    "model-output-id": modelOutputId,
    "input-rule": inputRuleId,
    "specific-source-system-index": +formData.sourceSystemIndex,
    "specific-source-model-index": +formData.sourceModelIndex,
    "specific-target-system-index": +formData.targetSystemIndex,
    "specific-target-model-index": +formData.targetModelIndex,
    "data-exchange-criteria": dataExchangeCriteriaId,
    "input-structure-name": formData.inputStructureName,
    "input-alias": transformInputAlias(formData.inputStructureName),
  };
};
