import * as Yup from "yup";

export const modelInputModelSchema = Yup.object().shape({
  sourceModel: Yup.string().required("Please, select source model"),
  targetModel: Yup.string().required("Please, select target model"),
  sourceModelOutput: Yup.string().required("Please, select source model output"),
  inputRule: Yup.string().required("Please, select source input rule"),
});

export const modelInputInitialState = {
  sourceModel: "",
  targetModel: "",
  sourceModelOutput: "",
  inputRule: "",
  sourceSystemIndex: "",
  sourceModelIndex: "",
  targetSystemIndex: "",
  targetModelIndex: "",
  dataExchangeCriteria: "",
  inputStructureName: "",
  inputAlias: "",
};
