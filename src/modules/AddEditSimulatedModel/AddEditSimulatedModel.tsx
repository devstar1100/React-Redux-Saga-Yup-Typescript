import { useDispatch } from "react-redux";
import { Grid, styled, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

import Seo from "../../components/Seo/Seo";
import React, { FC, ReactElement, useEffect } from "react";
import Container from "../../components/WidgetContainer/WidgetContainer";
import withSimulation from "../../hocs/withSimulation";
import Input from "../../components/Inputs/Input";
import CustomCheckbox from "../../components/Checkbox/Checkbox";
import Select from "../../components/Select/Select";
import { pages } from "../../lib/routeUtils";
import { format, parseISO } from "date-fns";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import {
  getEnumeratorsServer,
  getSimulationsServer,
  getSpecificEnumeratorServer,
} from "../../redux/actions/simulationsActions";
import { useFormik } from "formik";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import { fetchSimulatedSystemsServer } from "../../redux/actions/simulatedSystemsActions";
import {
  addSimulatedModelsServer,
  editSimulatedModelsServer,
  getSimulatedModelsServer,
  updateSimulatedModelErrors,
} from "../../redux/actions/simulatedModelsActions";
import { addSimulatedModelMapper } from "./lib/addSimulatedModelMapper";
import useGetEnumeratorOptions from "./hooks/useGetEnumeratorOptions";
import SimulatedModelActionButtonsBlock from "./components/ActionButtonBlock";
import { simulatedModelInitialState } from "./lib/simulatedModelInitialState";
import { getSimulatedModels, getSimulatedModelsValidationErrors } from "../../redux/reducers/simulatedModelsReducer";
import { simulatedModelMapper } from "./lib/simulatedModelMapper";
import { getStoredSimulatedSystems } from "../../redux/reducers/simulatedSystemsReducer";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import { transformModelClassName } from "./lib/transformModelClassName";
import {
  DEFAULT_EXECUTION_GROUP_ORDER_ID,
  DEFAULT_HARDWARE_MODEL_ID,
  DEFAULT_HARDWARE_INTERFACE_TYPE_ID,
  DEFAULT_HIGH_LEVEL_SYSTEM_OR_MODEL_ID,
  DEFAULT_INPUT_DATA_AGE_ID,
} from "./static/constants";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
}

interface Props {
  isEditMode?: boolean;
}

const numberOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const AddEditSimulatedModel = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { simulatedModelId, simulationName } = useParams();
  const navigate = useNavigate();

  const simulations = useSelector(getSimulations);
  const simulatedModels = useSelector(getSimulatedModels);
  const simulatedSystems = useSelector(getStoredSimulatedSystems) || [];
  const enumerators = useSelector(getEnumerators);
  const validationErrors = useSelector(getSimulatedModelsValidationErrors);
  const currentSimulatedModel = isEditMode
    ? (simulatedModels || []).find((model) => model["model-id"] === Number(simulatedModelId))
    : null;

  const [highLevelModels, highLevelModelsOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "high-level-models",
  });

  const [hardwareModels, hardwareModelsOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "hardware-models",
  });

  const [hardwareInterfaceTypes, hardwareInterfaceTypesOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "hw-interface-type",
  });

  const [executionFrequencies, executionFrequenciesOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "execution-frequencies",
  });

  const [inputDataAges, inputDataAgesOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "input-data-ages",
  });

  const [executionGroupOrders, executionGroupOrdersOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "execution-group-orders",
  });

  const simulationNames = getUniqSelectItems(simulations, "simulation-name");
  const simulatedSystemsClassNames = getUniqSelectItems(simulatedSystems, "model-class-name");

  const actionName = isEditMode ? "Edit" : "Create";

  const handleSubmit = () => {
    if (
      !highLevelModels ||
      !executionFrequencies ||
      !inputDataAges ||
      !executionGroupOrders ||
      !hardwareModels ||
      !hardwareInterfaceTypes
    )
      return;

    if (isEditMode) {
      dispatch(
        editSimulatedModelsServer({
          simulationName: values.simulationName,
          modelId: Number(simulatedModelId) || 0,
          simulatedModelData: addSimulatedModelMapper({
            formData: values,
            hardwareModels,
            simulatedSystems,
            highLevelModels,
            executionFrequencies,
            inputDataAges,
            executionGroupOrders,
            hardwareInterfaceTypes,
          }),
          redirect: () => navigate(pages.simulatedModelList(values.simulationName)),
        }),
      );
    } else {
      dispatch(
        addSimulatedModelsServer({
          simulationName: values.simulationName,
          modelId: 0,
          simulatedModelData: addSimulatedModelMapper({
            formData: values,
            simulatedSystems,
            hardwareModels,
            highLevelModels,
            executionFrequencies,
            inputDataAges,
            executionGroupOrders,
            hardwareInterfaceTypes,
          }),
          redirect: () => navigate(pages.simulatedModelList(values.simulationName)),
        }),
      );
    }
  };

  const { values, errors, handleChange, setValues, resetForm, submitForm } = useFormik({
    initialValues: simulatedModelInitialState,
    // validationSchema: addEditSimulatedModelSchema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    dispatch(getSimulationsServer({}));
    dispatch(getEnumeratorsServer());
    dispatch(getSpecificEnumeratorServer({ "enum-type": "high-level-models" }));

    return () => {
      dispatch(updateSimulatedModelErrors([]));
    };
  }, []);

  useEffect(() => {
    if (!values.simulationName && !simulationName) return;

    dispatch(
      fetchSimulatedSystemsServer({
        "simulation-name": values.simulationName || simulationName,
      }),
    );

    dispatch(
      getSimulatedModelsServer({
        simulationName: values.simulationName || (simulationName as string),
      }),
    );
  }, [values.simulationName, simulationName]);

  useEffect(() => {
    if (!simulationName) return;

    setValues((prev) => ({ ...prev, simulationName }));
  }, [simulationName]);

  useEffect(() => {
    if (currentSimulatedModel) {
      prefillForm();
      return;
    }

    // Find default enum values by ID, or fall back to initial state
    const defaultInputId = inputDataAges?.["enum-values"].find(
      (item) => item["enum-value-id"] === DEFAULT_INPUT_DATA_AGE_ID,
    );
    const defaultExecutionGroupOrder = executionGroupOrders?.["enum-values"].find(
      (item) => item["enum-value-id"] === DEFAULT_EXECUTION_GROUP_ORDER_ID,
    );
    const defaultHighLevelModel = highLevelModels?.["enum-values"].find(
      (item) => item["enum-value-id"] === DEFAULT_HIGH_LEVEL_SYSTEM_OR_MODEL_ID,
    );
    const defaultHardwareModel = hardwareModels?.["enum-values"].find(
      (item) => item["enum-value-id"] === DEFAULT_HARDWARE_MODEL_ID,
    );
    const defaultHardwareInterfaceType = hardwareInterfaceTypes?.["enum-values"].find(
      (item) => item["enum-value-id"] === DEFAULT_HARDWARE_INTERFACE_TYPE_ID,
    );

    setValues((prev) => ({
      ...prev,
      simulationName: prev.simulationName || (simulationName as string),
      executionGroupOrder:
        prev.executionGroupOrder ||
        defaultExecutionGroupOrder?.["enum-value-string"] ||
        simulatedModelInitialState.executionGroupOrder,
      inputDataAge:
        prev.inputDataAge || defaultInputId?.["enum-value-string"] || simulatedModelInitialState.inputDataAge,
      highLevelModel:
        prev.highLevelModel ||
        defaultHighLevelModel?.["enum-value-string"] ||
        simulatedModelInitialState.highLevelModel,
      hardwareModel:
        prev.hardwareModel || defaultHardwareModel?.["enum-value-string"] || simulatedModelInitialState.hardwareModel,
      hardwareInterfaceType:
        prev.hardwareInterfaceType ||
        defaultHardwareInterfaceType?.["enum-value-string"] ||
        simulatedModelInitialState.hardwareInterfaceType,
    }));
  }, [
    currentSimulatedModel,
    executionFrequencies,
    highLevelModels,
    inputDataAges,
    executionGroupOrders,
    hardwareModels,
    hardwareInterfaceTypes,
  ]);

  const prefillForm = () => {
    if (
      currentSimulatedModel &&
      executionFrequencies &&
      highLevelModels &&
      inputDataAges &&
      executionGroupOrders &&
      hardwareModels &&
      hardwareInterfaceTypes
    ) {
      setValues(
        simulatedModelMapper({
          simulatedModel: currentSimulatedModel,
          executionFrequencies,
          highLevelModels,
          inputDataAges,
          simulatedSystems,
          executionGroupOrders,
          hardwareModels,
          hardwareInterfaceTypes,
        }),
      );
    }
  };

  const handleSelectChange = (key: keyof typeof simulatedModelInitialState) => (value: string) => {
    setValues({ ...values, [key]: value });
  };

  const handleCheckboxChange = (key: keyof typeof simulatedModelInitialState) => (value: boolean) => {
    setValues({ ...values, [key]: value });
  };

  const handleCancel = () => {
    navigate(pages.simulatedModelList(simulationName || "unknown"));
  };

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Simulated models", to: pages.simulatedModelList(simulationName || "unknown") },
    { label: `${actionName} simulated model`, to: "" },
  ];

  return (
    <Wrapper>
      <Seo title={`${actionName} Simulated Model`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <SimulatedModelActionButtonsBlock onConfirm={submitForm} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!validationErrors?.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {validationErrors.map((error, index) => (
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
          title="Simulation Name"
          content={
            <Select
              placeholder="Enter Simulation Name"
              value={values.simulationName}
              onChange={handleSelectChange("simulationName")}
              options={simulationNames}
              error={!!errors.simulationName}
            />
          }
        />
        <MainContainer
          requireField
          title="Model Class Name"
          content={
            <Input
              // error={isNameMissing}
              helperText="The field is required, please fill in!"
              placeholder="Enter Class Name"
              value={values.modelClassName}
              handleChange={handleChange}
              formikName="modelClassName"
              error={!!errors.modelClassName}
            />
          }
        />

        <MainContainer
          title="Model Alias"
          content={
            <Input
              // error={isNameMissing}
              helperText="The field is required, please fill in!"
              placeholder="Fill Simulation Name field"
              value={transformModelClassName(values.modelClassName)}
              handleChange={() => null}
              formikName="modelAlias"
            />
          }
        />

        <MainContainer
          title="Is a sub-system"
          content={
            <CustomCheckbox isChecked={values.systemModelType} onChange={handleCheckboxChange("systemModelType")} />
          }
        />

        {values.systemModelType && (
          <MainContainer
            requireField
            title="Parent System"
            content={
              <Select
                // error={isNameMissing}
                value={values.parentSystem}
                onChange={handleSelectChange("parentSystem")}
                options={simulatedSystemsClassNames}
              />
            }
          />
        )}

        <MainContainer
          title="High level model type"
          content={
            <LongSelectWrapper>
              <Select
                value={values.highLevelModel}
                onChange={handleSelectChange("highLevelModel")}
                options={highLevelModelsOptions}
              />
            </LongSelectWrapper>
          }
        />

        <MainContainer
          title="Model has formal interfaces"
          content={
            <CustomCheckbox
              isChecked={values.hasFormalInterfaces}
              onChange={handleCheckboxChange("hasFormalInterfaces")}
            />
          }
        />

        <MainContainer
          title="Hardware model"
          content={
            <LongSelectWrapper>
              <Select
                value={values.hardwareModel}
                onChange={handleSelectChange("hardwareModel")}
                options={hardwareModelsOptions}
              />
            </LongSelectWrapper>
          }
        />

        <MainContainer
          title="Hardware interface type"
          content={
            <LongSelectWrapper>
              <Select
                value={values.hardwareInterfaceType}
                onChange={handleSelectChange("hardwareInterfaceType")}
                options={hardwareInterfaceTypesOptions}
              />
            </LongSelectWrapper>
          }
        />

        <MainContainer
          requireField
          title="Model execution frequency"
          content={
            <Select
              value={values.modelFrequency}
              onChange={handleSelectChange("modelFrequency")}
              options={executionFrequenciesOptions}
              error={!!errors.modelFrequency}
            />
          }
        />

        <MainContainer
          requireField
          title="# of steps per execution cycle"
          content={
            <Select
              value={values.stepsPerTick}
              onChange={handleSelectChange("stepsPerTick")}
              options={numberOptions}
              error={!!errors.stepsPerTick}
            />
          }
        />

        <MainContainer
          requireField
          title="Model plurality"
          content={
            <ShortInputWrapper>
              <Input
                type="number"
                value={values.plurality}
                handleChange={handleChange}
                formikName="plurality"
                error={!!errors.plurality}
              />
            </ShortInputWrapper>
          }
        />

        <MainContainer
          title="Model inputs age"
          content={
            <Select
              value={values.inputDataAge}
              onChange={handleSelectChange("inputDataAge")}
              options={inputDataAgesOptions}
            />
          }
        />

        <MainContainer
          title="Model execution group"
          content={
            <Select
              value={values.executionGroupOrder}
              onChange={handleSelectChange("executionGroupOrder")}
              options={executionGroupOrdersOptions}
            />
          }
        />

        {isEditMode && (
          <>
            <MainContainer
              title="Internal Id"
              content={
                <Typography variant="body2" color="main.100">
                  {currentSimulatedModel?.["model-id"]}
                </Typography>
              }
            />
            <MainContainer
              title="Creation Date"
              content={
                <Typography variant="body2" color="main.100">
                  {format(
                    parseISO(currentSimulatedModel?.["creation-date"] || new Date().toISOString()),
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
                    parseISO(currentSimulatedModel?.["last-update-date"] || new Date().toISOString()),
                    "yyyy-MM-dd HH:mm",
                  )}
                </Typography>
              }
            />
            <MainContainer
              title="# of input messages"
              content={
                <Typography variant="body2" color="main.100">
                  {currentSimulatedModel?.["number-of-input-messages"]}
                </Typography>
              }
            />
            <MainContainer
              title="# of output messages"
              content={
                <Typography variant="body2" color="main.100">
                  {currentSimulatedModel?.["number-of-output-messages"]}
                </Typography>
              }
            />
            <MainContainer
              title="Documentation"
              content={
                currentSimulatedModel?.["path-to-documentation"] ? (
                  <Typography variant="body2" color="main.100">
                    <a
                      href={currentSimulatedModel["path-to-documentation"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      {(() => {
                        const path = currentSimulatedModel["path-to-documentation"]; // e.g. "path/classSdsTransceiverAlgo.html"
                        const file = path.split("/").pop() || ""; // "classSdsTransceiverAlgo.html"
                        const noExt = file.replace(".html", ""); // "classSdsTransceiverAlgo"
                        const prefix = "class";

                        if (noExt.startsWith(prefix)) {
                          const rest = noExt.slice(prefix.length); // "SdsTransceiverAlgo"
                          return `${rest} class`; // "SdsTransceiverAlgo class"
                        }

                        return noExt; // fallback if pattern doesn't match
                      })()}
                    </a>
                  </Typography>
                ) : (
                  <Typography variant="body2" color="main.100">
                    Not provided
                  </Typography>
                )
              }
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
    minWidth: "330px !important",

    ".MuiInputBase-root": {
      width: "330px !important",
    },
  },
});

const ShortInputWrapper = styled("div")({
  ".MuiInputBase-root": {
    width: "220px !important",

    ".MuiInputBase-input": {
      padding: "9px 12px",
    },
  },

  ".error-icon": {
    top: "11px",
    right: "11px",
  },
});

const ListWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
});

export default withSimulation(AddEditSimulatedModel);
