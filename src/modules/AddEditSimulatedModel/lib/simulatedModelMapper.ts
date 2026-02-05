import { SimulatedModel } from "../../../types/SimulatedModel";
import { ISimulatedSystem } from "../../../types/simulatedSystems";
import { SimulationEnumType } from "../../../types/simulations";
import { simulatedModelInitialState } from "./simulatedModelInitialState";

interface Props {
  simulatedModel: SimulatedModel;
  simulatedSystems: ISimulatedSystem[];
  highLevelModels: SimulationEnumType;
  executionFrequencies: SimulationEnumType;
  inputDataAges: SimulationEnumType;
  hardwareModels: SimulationEnumType;
  executionGroupOrders: SimulationEnumType;
  modelSources?: SimulationEnumType;
  hardwareInterfaceTypes: SimulationEnumType;
}

const getEnumValueById = (simulationEnum: SimulationEnumType, id: number) => {
  const value = simulationEnum["enum-values"].find((value) => value["enum-value-id"] === id)?.["enum-value-string"];

  return value;
};

export const simulatedModelMapper = ({
  simulatedModel,
  highLevelModels,
  executionFrequencies,
  simulatedSystems,
  hardwareModels,
  inputDataAges,
  executionGroupOrders,
  modelSources,
  hardwareInterfaceTypes,
}: Props): typeof simulatedModelInitialState => {
  // const parentSystemId = simulatedSystems.find((system) => system["model-id"] === simulatedModel["model-id"]).pa;

  const inputDataAge =
    getEnumValueById(inputDataAges, simulatedModel["input-data-age"]) || simulatedModelInitialState.inputDataAge;

  const highLevelModel =
    getEnumValueById(highLevelModels, simulatedModel["high-level-model"]) || simulatedModelInitialState.highLevelModel;

  const modelFrequency =
    getEnumValueById(executionFrequencies, simulatedModel["model-frequency"]) ||
    simulatedModelInitialState.modelFrequency;

  const hardwareModel =
    getEnumValueById(hardwareModels, simulatedModel["hardware-model"]) || simulatedModelInitialState.hardwareModel;

  const executionGroupOrder =
    getEnumValueById(executionGroupOrders, simulatedModel["execution-group-order"]) ||
    simulatedModelInitialState.executionGroupOrder;

  const parentSystem =
    simulatedSystems.find((system) => system["model-id"] === simulatedModel["parent-system-id"])?.[
      "model-class-name"
    ] || simulatedModelInitialState.parentSystem;

  const modelSource =
    (modelSources ? getEnumValueById(modelSources, simulatedModel["model-source"] || 2) : undefined) ||
    simulatedModelInitialState.modelSource;

  const hardwareInterfaceType =
    getEnumValueById(hardwareInterfaceTypes, simulatedModel["hardware-interface-type"] || 0) ||
    simulatedModelInitialState.hardwareInterfaceType;

  return {
    executionGroupOrder,
    hardwareModel,
    hardwareInterfaceType,
    hasFormalInterfaces: simulatedModel["has-formal-interfaces"],
    highLevelModel,
    inputDataAge,
    modelAlias: simulatedModel["model-alias"],
    modelClassName: simulatedModel["model-class-name"],
    modelFrequency,
    modelSource,
    parentSystem,
    plurality: simulatedModel["plurality"].toString(),
    simulationName: simulatedModel["simulation-name"],
    stepsPerTick: simulatedModel["number-of-steps-per-tick"].toString(),
    systemModelType: simulatedModel["system-or-model-type"] === 2,
  };
};
