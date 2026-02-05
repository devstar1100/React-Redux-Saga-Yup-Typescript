import * as Yup from "yup";

export const addEditSimulatedModelSchema = Yup.object().shape({
  simulationName: Yup.string().required("Please, select simulation name"),
  modelClassName: Yup.string().required("Please, enter model class name"),
  modelFrequency: Yup.string().required("Please, enter model execution frequency"),
  stepsPerTick: Yup.string().required("Please, select # of steps per execution cycle"),
  plurality: Yup.string().required("Please, enter model plurality"),
});

export const simulatedModelInitialState = {
  simulationName: "",
  modelClassName: "",
  modelAlias: "",
  systemModelType: false,
  parentSystem: "",
  highLevelModel: "",
  hasFormalInterfaces: false,
  hardwareModel: "",
  modelFrequency: "",
  stepsPerTick: "",
  plurality: "",
  inputDataAge: "",
  executionGroupOrder: "",
};
