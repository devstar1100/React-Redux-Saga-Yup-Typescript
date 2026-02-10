import { useDispatch } from "react-redux";
import { Grid, styled, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

import Seo from "../../components/Seo/Seo";
import { FC, ReactElement, useEffect, useState } from "react";
import Container from "../../components/WidgetContainer/WidgetContainer";
import withSimulation from "../../hocs/withSimulation";
import Input from "../../components/Inputs/Input";
import Select from "../../components/Select/Select";
import { pages } from "../../lib/routeUtils";
import { format, parseISO } from "date-fns";
import { getEnumerators } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { useFormik } from "formik";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import { getSimulatedModelsServer } from "../../redux/actions/simulatedModelsActions";
import { getSimulatedModels } from "../../redux/reducers/simulatedModelsReducer";
import { fetchModelOutputsListServer } from "../../redux/actions/modelOutputsActions";
import { getStoredModelOutputs } from "../../redux/reducers/modelOutputsReducer";
import { getModelInputsValidationErrors, getStoredModelInputs } from "../../redux/reducers/modelInputsReducer";
import {
  addModelInputServer,
  editModelInputServer,
  fetchModelInputsServer,
  setModelInputsValidationErrors,
} from "../../redux/actions/modelInputsActions";
import SimulatedModelActionButtonsBlock from "./components/ActionButtonBlock";
import { modelInputInitialState } from "./lib/addEditModelInputSchema";
import useGetEnumeratorOptions from "../../hooks/useGetEnumeratorOptions";
import { addModelInputMapper } from "./lib/addModelInputMapper";
import { transformInputAlias } from "./lib/transformInputAlias";
import { modelInputMapper } from "./lib/modelInputMapper";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
}

interface Props {
  isEditMode?: boolean;
}

const AddEditModelInput = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { modelInputId, simulationName } = useParams();
  const navigate = useNavigate();

  const modelInputs = useSelector(getStoredModelInputs);
  const storedModelOutputs = useSelector(getStoredModelOutputs);
  const modelOutputs = storedModelOutputs?.["model-outputs"] || [];
  const simulatedModels = useSelector(getSimulatedModels) || [];
  const enumerators = useSelector(getEnumerators);
  const modelInputsValidationErrors = useSelector(getModelInputsValidationErrors);

  const [dataExchangeCriteria, dataExchangeCriteriaOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "data-exchange-criterias",
  });

  const [messageTypes] = useGetEnumeratorOptions({
    enumerators,
    enumType: "message-types",
  });

  const [inputRules, inputRulesOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "input-rules",
  });

  const currentInputModel = isEditMode
    ? (modelInputs || []).find((model) => model["model-input-id"] === Number(modelInputId))
    : null;

  const actionName = isEditMode ? "Edit" : "Create";

  const handleSubmit = () => {
    if (!simulationName || !dataExchangeCriteria || !inputRules || !messageTypes) return;

    if (isEditMode && modelInputId) {
      dispatch(
        editModelInputServer({
          "model-input-id": +modelInputId,
          "simulation-name": simulationName,
          modelInputData: addModelInputMapper({
            formData: values,
            modelOutputs,
            dataExchangeCriteria,
            simulatedModels,
            inputRules,
            messageTypes,
          }),
          redirect: () => navigate(pages.modelInputs(simulationName)),
        }),
      );
      return;
    }

    dispatch(
      addModelInputServer({
        "simulation-name": simulationName,
        modelInputData: addModelInputMapper({
          formData: values,
          modelOutputs,
          dataExchangeCriteria,
          simulatedModels,
          inputRules,
          messageTypes,
        }),
        redirect: () => navigate(pages.modelInputs(simulationName)),
      }),
    );
  };

  const { values, errors, handleChange, setValues, touched, resetForm, submitForm } = useFormik({
    initialValues: modelInputInitialState,
    // validationSchema: modelInputModelSchema,
    onSubmit: handleSubmit,
  });

  const sourceModelOptions = getUniqSelectItems(modelOutputs, "model-full-path");
  const targetModelOptions = getUniqSelectItems(simulatedModels, "model-full-path").filter(
    (item) => item !== values.sourceModel,
  );

  const sourceModelOutpuOptions = Array.from(
    new Set(
      modelOutputs
        .filter((item) => item["model-full-path"] === values.sourceModel)
        .map((item) => {
          const currentMessageType = messageTypes?.["enum-values"].find(
            (el) => el["enum-value-id"] === item["message-type"],
          );

          return `${item["output-structure-name"]}[${currentMessageType?.["enum-value-string"] || ""}]`;
        }),
    ),
  );

  const inputRuleId = inputRules?.["enum-values"].find((item) => item["enum-value-string"] === values.inputRule)?.[
    "enum-value-id"
  ];

  const currentDataExchangeCriteria = dataExchangeCriteria?.["enum-values"].find(
    (item) => item["enum-value-string"] === values.dataExchangeCriteria,
  )?.["enum-value-id"];

  useEffect(() => {
    if (!simulationName) return;

    dispatch(
      fetchModelInputsServer({
        "simulation-name": simulationName,
      }),
    );

    dispatch(
      getSimulatedModelsServer({
        simulationName,
      }),
    );
    dispatch(getEnumeratorsServer());
  }, [simulationName]);

  useEffect(() => {
    if (!simulationName && !values.sourceModel) return;

    const modelOutput = modelOutputs.find((output) => output["model-full-path"] === values.sourceModel);

    dispatch(
      fetchModelOutputsListServer({
        "simulation-name": modelOutput?.["simulation-name"] || (simulationName as string),
      }),
    );
  }, [values.sourceModel, simulationName]);

  useEffect(() => {
    if (!currentInputModel) return;

    prefillForm();
  }, [currentInputModel]);

  const prefillForm = () => {
    if (currentInputModel && messageTypes && dataExchangeCriteria && inputRules && messageTypes) {
      setValues(
        modelInputMapper({
          modelInput: currentInputModel,
          modelOutputs,
          dataExchangeCriteria,
          inputRules,
          messageTypes,
        }),
      );
    }
  };

  const handleSelectChange = (key: keyof typeof modelInputInitialState) => (value: string) => {
    if (key === "sourceModel") {
      setValues({
        ...values,
        [key]: value,
        targetModel: modelInputInitialState.targetModel,
        sourceModelOutput: modelInputInitialState.sourceModel,
      });
      return;
    }

    setValues({ ...values, [key]: value });
  };

  const handleCancel = () => {
    navigate(pages.modelInputs(simulationName || "unknown"));
  };

  useEffect(() => {
    const currentModelOutput = modelOutputs.find((item) => {
      const currentMessageType = messageTypes?.["enum-values"].find(
        (el) => el["enum-value-id"] === item["message-type"],
      );

      return (
        `${item["output-structure-name"]}[${currentMessageType?.["enum-value-string"] || ""}]` ===
        values.sourceModelOutput
      );
    });

    if (!currentModelOutput) return;

    const isFormal = currentModelOutput["message-type"] === 2 || currentModelOutput["message-type"] === 4;
    const prefix = storedModelOutputs?.["default-model-output-structure-prefix"].match(
      /([A-Z][a-z]+|[A-Z]+(?=[A-Z][a-z])|[a-z]+)/g,
    );

    const postfix = isFormal ? "FormalOutput" : "Output";

    const sourceModel = modelOutputs.find((item) => item["model-full-path"] === values.sourceModel);
    const targetModel = modelOutputs.find((item) => item["model-full-path"] === values.targetModel);

    const inputStructureName = `${prefix?.[0] || ""}${sourceModel?.["model-class-name"]}${prefix?.[1] || ""}${
      targetModel?.["model-class-name"]
    }${sourceModel?.["output-structure-name"]}${postfix}`;

    setValues((prev) => ({ ...prev, inputStructureName }));
  }, [values.targetModel, values.sourceModel, values.sourceModelOutput]);

  useEffect(() => {
    dispatch(setModelInputsValidationErrors([]));
  }, []);

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Model Inputs", to: pages.modelInputs(simulationName ?? "") },
    { label: `${actionName} model input`, to: "" },
  ];

  return (
    <Wrapper>
      <Seo title={`${actionName} Model Input`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <SimulatedModelActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!modelInputsValidationErrors?.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {modelInputsValidationErrors.map((error, index) => (
                  <div key={error["form-field-name"]}>
                    <Typography variant="body2" color="red.100">
                      {index + 1}. {error["form-field-error"]}
                    </Typography>
                  </div>
                ))}
              </ListWrapper>
            }
          />
        )}
        <MainContainer
          requireField
          title="Source Model"
          content={
            <LongSelectWrapper>
              <Select
                placeholder="Enter Source Model"
                value={values.sourceModel}
                onChange={handleSelectChange("sourceModel")}
                options={sourceModelOptions}
                error={touched.sourceModel && !!errors.sourceModel}
              />
            </LongSelectWrapper>
          }
        />
        <MainContainer
          requireField
          title="Target Model"
          content={
            <LongSelectWrapper>
              <Select
                placeholder="Enter Target Model"
                value={values.targetModel}
                onChange={handleSelectChange("targetModel")}
                options={targetModelOptions}
                error={touched.targetModel && !!errors.targetModel}
              />
            </LongSelectWrapper>
          }
        />
        <MainContainer
          requireField
          title="Source Model Output"
          content={
            <LongSelectWrapper>
              <Select
                placeholder="Enter Source Model Output"
                value={values.sourceModelOutput}
                onChange={handleSelectChange("sourceModelOutput")}
                options={sourceModelOutpuOptions}
                error={touched.sourceModelOutput && !!errors.sourceModelOutput}
              />
            </LongSelectWrapper>
          }
        />
        <MainContainer
          requireField
          title="Input Rule"
          content={
            <LongSelectWrapper>
              <Select
                placeholder="Enter Input Rule"
                value={values.inputRule}
                onChange={handleSelectChange("inputRule")}
                options={inputRulesOptions}
                error={touched.inputRule && !!errors.inputRule}
              />
            </LongSelectWrapper>
          }
        />
        <MainContainer
          requireField
          title="Data exchange criteria"
          content={
            <LongSelectWrapper>
              <Select
                placeholder="Enter data exchange criteria"
                value={values.dataExchangeCriteria}
                onChange={handleSelectChange("dataExchangeCriteria")}
                options={dataExchangeCriteriaOptions}
                error={touched.dataExchangeCriteria && !!errors.dataExchangeCriteria}
              />
            </LongSelectWrapper>
          }
        />
        {!!modelOutputs.length && currentDataExchangeCriteria === 2 && (
          <>
            <MainContainer
              requireField
              title="Source System index"
              content={
                <Select
                  placeholder="Enter source system index"
                  value={values.sourceSystemIndex}
                  onChange={handleSelectChange("sourceSystemIndex")}
                  options={new Array(modelOutputs.length).fill(0).map((_, index) => index.toString())}
                  error={touched.sourceSystemIndex && !!errors.sourceSystemIndex}
                />
              }
            />
            <MainContainer
              requireField
              title="Source Model index"
              content={
                <Select
                  placeholder="Enter source model index"
                  value={values.sourceModelIndex}
                  onChange={handleSelectChange("sourceModelIndex")}
                  options={new Array(modelOutputs.length).fill(0).map((_, index) => index.toString())}
                  error={touched.sourceModelIndex && !!errors.sourceModelIndex}
                />
              }
            />
            <MainContainer
              requireField
              title="Target System index"
              content={
                <Select
                  placeholder="Enter target system index"
                  value={values.targetSystemIndex}
                  onChange={handleSelectChange("targetSystemIndex")}
                  options={new Array(modelOutputs.length).fill(0).map((_, index) => index.toString())}
                  error={touched.targetSystemIndex && !!errors.targetSystemIndex}
                />
              }
            />
            <MainContainer
              requireField
              title="Target Model index"
              content={
                <LongSelectWrapper>
                  <Select
                    placeholder="Enter target model index"
                    value={values.targetModelIndex}
                    onChange={handleSelectChange("targetModelIndex")}
                    options={new Array(modelOutputs.length).fill(0).map((_, index) => index.toString())}
                    error={touched.targetModelIndex && !!errors.targetModelIndex}
                  />
                </LongSelectWrapper>
              }
            />
          </>
        )}
        <MainContainer
          requireField
          title="Input Structure Name"
          content={
            <LongInputWrapper>
              <Input
                placeholder="Enter structure name"
                value={values.inputStructureName}
                handleChange={handleChange("inputStructureName")}
                error={touched.inputStructureName && !!errors.inputStructureName}
              />
            </LongInputWrapper>
          }
        />
        <MainContainer
          requireField
          title="Input Alias"
          content={
            <LongInputWrapper>
              <Input
                placeholder="Enter input alias"
                value={transformInputAlias(values.inputStructureName)}
                handleChange={() => null}
                error={touched.inputStructureName && !!errors.inputStructureName}
              />
            </LongInputWrapper>
          }
        />
        {currentInputModel && (
          <>
            <MainContainer
              title="Generic output identifier"
              content={
                <Typography variant="body2" color="main.100">
                  {currentInputModel?.["generic-model-output-identifier"]}
                </Typography>
              }
            />
            <MainContainer
              title="Internal Id"
              content={
                <Typography variant="body2" color="main.100">
                  {currentInputModel?.["model-input-id"]}
                </Typography>
              }
            />
            <MainContainer
              title="Creation Date"
              content={
                <Typography variant="body2" color="main.100">
                  {format(
                    parseISO(currentInputModel?.["creation-date"] || new Date().toISOString()),
                    "yyyy-MM-dd HH:mm",
                  )}
                </Typography>
              }
            />
            <MainContainer
              title="Last update date"
              content={
                <Typography variant="body2" color="main.100">
                  {format(
                    parseISO(currentInputModel?.["last-update-date"] || new Date().toISOString()),
                    "yyyy-MM-dd HH:mm",
                  )}
                </Typography>
              }
            />
            <MainContainer
              title="Documentation"
              content={(() => {
                // Find the model output that matches the selected sourceModelOutput
                const currentModelOutput = modelOutputs.find((item) => {
                  const currentMessageType = messageTypes?.["enum-values"].find(
                    (el) => el["enum-value-id"] === item["message-type"],
                  );
                  return (
                    `${item["output-structure-name"]}[${currentMessageType?.["enum-value-string"] || ""}]` ===
                    values.sourceModelOutput
                  );
                });
                // Extract the documentation path from the matched model output (e.g. "path/structSdsStructName.html")
                const docPath = currentModelOutput?.["path-to-documentation"];
                // Helper: convert "path/structSdsStructName.html" → "SdsStructName structure"
                const transformFilename = (path: string) => {
                  const file = path.split("/").pop() || ""; // "structSdsStructName.html"
                  const noExt = file.replace(".html", ""); // "structSdsStructName"
                  const prefix = "struct";
                  if (noExt.startsWith(prefix)) {
                    const rest = noExt.slice(prefix.length); // "SdsStructName"
                    return `${rest} structure`; // "SdsStructName structure"
                  }
                  return noExt; // fallback if pattern doesn't match
                };
                return docPath ? (
                  <Typography variant="body2" color="main.100">
                    <a
                      href={docPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      {transformFilename(docPath)}
                    </a>
                  </Typography>
                ) : (
                  <Typography variant="body2" color="main.100">
                    Not provided
                  </Typography>
                );
              })()}
            />
          </>
        )}
      </Container>
    </Wrapper>
  );
};

const MainContainer: FC<IMainContainer> = ({ title, content, requireField }): ReactElement => (
  <Grid container flexWrap="nowrap" alignItems="center" p="4px 0" className="customMainContainer">
    <Grid container width={{ xs: "180px", lg: "326px" }} flexWrap="nowrap">
      <Typography variant="body2" color="grey.50">
        {title}
      </Typography>
      {requireField && (
        <Typography variant="body2" color="red.400" ml="5px">
          *
        </Typography>
      )}
    </Grid>
    <Grid>{content}</Grid>
  </Grid>
);

const Wrapper = styled(Grid)(({ theme }) => ({
  width: "100%",
  ".customHeading": {
    padding: "23px 24px",
  },
  ".customContent": {
    padding: "24px 24px 16px 24px",
  },
  ".MuiInputBase-root": {
    width: "500px !important",
  },
  ".customMainContainer:first-of-type": {
    padding: "0 0 4px 0",
  },
  ".customMainContainer": {
    borderBottom: `1px solid ${theme.palette.grey["500"]}`,
  },
  ".customMainContainer:last-child": {
    border: "none",
  },
  ".sideBarItemTitle": {
    border: "none",
    padding: 0,
    ".collapseWrapper": {
      backgroundColor: theme.palette.additional[700],
      borderRadius: theme.borderRadius.sm,
    },
  },
  ".customSelect": {
    width: "100% !important",
    backgroundColor: "#1F1F22",
    ".MuiInputBase-root": {
      width: "222px !important",
      border: "1px solid transparent !important",
      h6: {
        fontSize: "14px",
        lineHeight: "20px",
        fontWeight: 400,
      },
    },
  },
  "@media(max-width: 1200px)": {
    ".MuiInputBase-root": {
      width: "385px !important",
      ".MuiInputBase-input": {
        padding: "6px",
        fontSize: "12px",
        lineHeight: "18px",
      },
    },
    ".customSelect": {
      ".MuiInputBase-root": {
        h6: {
          fontSize: "12px",
          lineHeight: "18px",
        },
      },
    },
  },
}));

const LongSelectWrapper = styled("div")({
  ".customSelect": {
    maxWidth: "none",
    minWidth: "500px !important",

    ".MuiInputBase-root": {
      width: "500px !important",
    },
  },
});

const ListWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
});

const LongInputWrapper = styled("div")({
  ".MuiInputBase-root": {
    width: "750px !important",
  },

  "@media(max-width: 1200px)": {
    ".MuiInputBase-root": {
      width: "500px !important",
    },
  },
});

export default withSimulation(AddEditModelInput);
