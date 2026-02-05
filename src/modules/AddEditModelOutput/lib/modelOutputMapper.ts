import { SimulatedModel } from "../../../types/SimulatedModel";
import { IModelOutput } from "../../../types/modelOutput";
import { ISimulatedSystem } from "../../../types/simulatedSystems";
import { SimulationEnumType } from "../../../types/simulations";
import { modelOutputInitialState } from "./addEditModelOutputSchema";

interface Props {
  modelOutput: IModelOutput;
  simulatedSystems: ISimulatedSystem[];
  messageTypes: SimulationEnumType;
}

const getEnumValueById = (simulationEnum: SimulationEnumType, id: number) => {
  const value = simulationEnum["enum-values"].find((value) => value["enum-value-id"] === id)?.["enum-value-string"];

  return value;
};

export const modelOutputMapper = ({
  modelOutput,
  simulatedSystems,
  messageTypes,
}: Props): typeof modelOutputInitialState => {
  const messageType =
    getEnumValueById(messageTypes, modelOutput["message-type"]) || modelOutputInitialState.messageType;

  return {
    messageType,
    modelFullPath: modelOutput["model-full-path"],
    outputAlias: modelOutput["output-alias"],
    outputStructureName: modelOutput["output-structure-name"],
    outputSuffix: modelOutput["output-suffix"],
  };
};
