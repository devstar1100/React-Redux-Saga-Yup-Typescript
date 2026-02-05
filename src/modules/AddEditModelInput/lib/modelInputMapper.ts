import { IModelInput } from "../../../types/modelInput";
import { IModelOutput } from "../../../types/modelOutput";
import { SimulationEnumType } from "../../../types/simulations";
import { modelInputInitialState } from "./addEditModelInputSchema";

interface Props {
  modelInput: IModelInput;
  modelOutputs: IModelOutput[];
  dataExchangeCriteria: SimulationEnumType;
  inputRules: SimulationEnumType;
  messageTypes: SimulationEnumType;
}

const getModelOutput = (list: IModelOutput[], key: keyof IModelOutput, value: IModelOutput[keyof IModelOutput]) => {
  return list.find((item) => item[key] === value);
};

const getEnumValueById = (simulationEnum: SimulationEnumType, id: number) => {
  const value = simulationEnum["enum-values"].find((value) => value["enum-value-id"] === id)?.["enum-value-string"];

  return value;
};

export const modelInputMapper = ({
  modelInput,
  modelOutputs,
  dataExchangeCriteria,
  inputRules,
  messageTypes,
}: Props): typeof modelInputInitialState => {
  const dataExchangeCriteriaValue =
    getEnumValueById(dataExchangeCriteria, modelInput["data-exchange-criteria"]) ||
    modelInputInitialState.dataExchangeCriteria;

  const inputRule = getEnumValueById(inputRules, modelInput["input-rule"]) || modelInputInitialState.inputRule;

  const sourceModel =
    getModelOutput(modelOutputs, "model-id", modelInput["source-model-id"])?.["model-full-path"] ||
    modelInputInitialState.sourceModel;

  const targetModel =
    getModelOutput(modelOutputs, "model-id", modelInput["target-model-id"])?.["model-full-path"] ||
    modelInputInitialState.targetModel;

  const sourceModelOutput = getModelOutput(modelOutputs, "model-output-id", modelInput["model-output-id"]);
  const currentMessageType = messageTypes?.["enum-values"].find(
    (el) => el["enum-value-id"] === sourceModelOutput?.["message-type"],
  );
  const sourceModelOutputValue = sourceModelOutput
    ? `${sourceModelOutput?.["output-structure-name"]}[${currentMessageType?.["enum-value-string"]}]`
    : modelInputInitialState.sourceModelOutput;

  return {
    dataExchangeCriteria: dataExchangeCriteriaValue,
    inputAlias: modelInput["input-alias"],
    inputRule,
    inputStructureName: modelInput["input-structure-name"],
    sourceModel,
    sourceModelIndex: modelInput["specific-source-model-index"].toString(),
    sourceModelOutput: sourceModelOutputValue,
    sourceSystemIndex: modelInput["specific-source-system-index"].toString(),
    targetModel,
    targetModelIndex: modelInput["specific-target-model-index"].toString(),
    targetSystemIndex: modelInput["specific-target-system-index"].toString(),
  };
};
