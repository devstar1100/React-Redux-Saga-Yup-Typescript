import { ModelOutputRequest } from "../../../redux/actions/modelOutputsActions";
import { SimulatedModel } from "../../../types/SimulatedModel";
import { SimulationEnumType } from "../../../types/simulations";
import { modelOutputInitialState } from "./addEditModelOutputSchema";
import { transformOutputAlias } from "./transformOutputAlias";

interface Props {
  formData: typeof modelOutputInitialState;
  messageTypes: SimulationEnumType;
  simulatedModels: SimulatedModel[];
}

const getEnumValueId = (simulationEnum: SimulationEnumType, value: string) => {
  const id = simulationEnum?.["enum-values"].find((model) => model["enum-value-string"] === value)?.["enum-value-id"];

  return id;
};

export const addModelOutputMapper = ({ formData, messageTypes, simulatedModels }: Props): ModelOutputRequest => {
  const messageType = getEnumValueId(messageTypes, formData.messageType) || 0;

  const currentModel = simulatedModels.find(
    (model) => model["model-full-path"].replaceAll(" ", "") === formData.modelFullPath.replaceAll(" ", ""),
  )?.["model-id"];

  return {
    "message-type": messageType,
    "model-full-path": formData.modelFullPath,
    "output-alias": transformOutputAlias(formData.outputStructureName),
    "output-structure-name": formData.outputStructureName,
    "output-suffix": formData.outputSuffix,
    "model-id": currentModel,
  };
};
