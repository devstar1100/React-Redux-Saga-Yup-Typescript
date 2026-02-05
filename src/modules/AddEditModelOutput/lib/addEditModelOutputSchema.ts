import * as Yup from "yup";

export const modelOutputModelSchema = Yup.object().shape({
  modelFullPath: Yup.string().required("Please, select model full path"),
  messageType: Yup.string().required("Please, select message type"),
});

export const modelOutputInitialState = {
  modelFullPath: "",
  messageType: "",
  outputSuffix: "",
  outputStructureName: "",
  outputAlias: "",
};
