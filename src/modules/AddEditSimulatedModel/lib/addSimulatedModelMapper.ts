import { SimulatedModelRequest } from "../../../redux/actions/simulatedModelsActions";
import { SimulatedModel } from "../../../types/SimulatedModel";
import { ISimulatedSystem } from "../../../types/simulatedSystems";
import { SimulationEnumType } from "../../../types/simulations";
import { simulatedModelInitialState } from "./simulatedModelInitialState";
import { transformModelClassName } from "./transformModelClassName";

interface Props {
  formData: typeof simulatedModelInitialState;
  simulatedSystems: ISimulatedSystem[];
  highLevelModels: SimulationEnumType;
  executionFrequencies: SimulationEnumType;
  inputDataAges: SimulationEnumType;
  executionGroupOrders: SimulationEnumType;
  hardwareModels: SimulationEnumType;
  hardwareInterfaceTypes: SimulationEnumType;
}

const getEnumValueId = (simulationEnum: SimulationEnumType, value: string) => {
  const id = simulationEnum?.["enum-values"].find((model) => model["enum-value-string"] === value)?.["enum-value-id"];

  return id;
};

export const addSimulatedModelMapper = ({
  formData,
  simulatedSystems,
  highLevelModels,
  executionFrequencies,
  hardwareModels,
  inputDataAges,
  executionGroupOrders,
  hardwareInterfaceTypes,
}: Props): SimulatedModelRequest => {
  const parentSystemId = simulatedSystems.find((system) => system["model-class-name"] === formData.parentSystem)?.[
    "model-id"
  ];

  const highLevelModelId = getEnumValueId(highLevelModels, formData.highLevelModel);
  const executionFrequencyId = getEnumValueId(executionFrequencies, formData.modelFrequency);
  const inputDataAgeId = getEnumValueId(inputDataAges, formData.inputDataAge);
  const executionGroupOrderId = getEnumValueId(executionGroupOrders, formData.executionGroupOrder);
  const hardwareModelId = getEnumValueId(hardwareModels, formData.hardwareModel);
  const hardwareInterfaceTypeId = getEnumValueId(hardwareInterfaceTypes, formData.hardwareInterfaceType);

  return {
    "execution-group-order": executionGroupOrderId || 1,
    "hardware-model": hardwareModelId || 0,
    "hardware-interface-type": hardwareInterfaceTypeId || 0,
    "has-formal-interfaces": formData.hasFormalInterfaces,
    "high-level-model": highLevelModelId || 0,
    "input-data-age": inputDataAgeId || 1,
    "model-alias": transformModelClassName(formData.modelClassName),
    "model-class-name": formData.modelClassName,
    "model-frequency": (executionFrequencyId as number) || 1,
    "number-of-steps-per-tick": parseInt(formData.stepsPerTick) || 1,
    "parent-system-id": parentSystemId || 0,
    plurality: parseInt(formData.plurality) || 1,
    "simulation-name": formData.simulationName,
    "system-or-model-type": formData.systemModelType ? 2 : 3,
  };
};
