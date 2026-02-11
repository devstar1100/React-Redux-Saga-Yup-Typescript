import { useDispatch } from "react-redux";
import { Grid, styled, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

import Seo from "../../components/Seo/Seo";
import { FC, ReactElement, useEffect } from "react";
import Container from "../../components/WidgetContainer/WidgetContainer";
import withSimulation from "../../hocs/withSimulation";
import Input from "../../components/Inputs/Input";
import Select from "../../components/Select";
import { pages } from "../../lib/routeUtils";
import { format, parseISO } from "date-fns";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { useFormik } from "formik";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import { fetchSimulatedSystemsServer } from "../../redux/actions/simulatedSystemsActions";
import { getSimulatedModelsServer } from "../../redux/actions/simulatedModelsActions";
import { addModelOutputMapper } from "./lib/addModelOutputMapper";
import useGetEnumeratorOptions from "../../hooks/useGetEnumeratorOptions";
import SimulatedModelActionButtonsBlock from "./components/ActionButtonBlock";
import { getSimulatedModels } from "../../redux/reducers/simulatedModelsReducer";
import { modelOutputMapper } from "./lib/modelOutputMapper";
import { getStoredSimulatedSystems } from "../../redux/reducers/simulatedSystemsReducer";
import {
  addModelOutputServer,
  editModelOutputServer,
  fetchModelOutputsListServer,
  updateModelOutputsValidationErrors,
} from "../../redux/actions/modelOutputsActions";
import { getModelOutputsValidationErrors, getStoredModelOutputs } from "../../redux/reducers/modelOutputsReducer";
import { modelOutputInitialState, modelOutputModelSchema } from "./lib/addEditModelOutputSchema";
import { addEditSimulatedModelSchema } from "../AddEditSimulatedModel/lib/addEditSimulatedModelSchema";
import { transformOutputAlias } from "./lib/transformOutputAlias";
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

const AddEditModelOutput = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { modelOutputId, simulationName } = useParams();
  const navigate = useNavigate();

  const simulatedModels = useSelector(getSimulatedModels) || [];
  const simulatedSystems = useSelector(getStoredSimulatedSystems) || [];
  const modelOutputsData = useSelector(getStoredModelOutputs);
  const modelOutputs = modelOutputsData?.["model-outputs"] || [];
  const enumerators = useSelector(getEnumerators);
  const modelOutputsValidationErrors = useSelector(getModelOutputsValidationErrors);

  const currentOutputModel = isEditMode
    ? (modelOutputs || []).find((model) => model["model-output-id"] === Number(modelOutputId))
    : null;

  const [messageTypes, messageTypesOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "message-types",
  });

  const modelFullPaths = getUniqSelectItems(simulatedModels, "model-full-path");

  const actionName = isEditMode ? "Edit" : "Create";

  const handleSubmit = () => {
    if (!messageTypes || !modelFullPaths || !simulationName) return;

    if (isEditMode) {
      dispatch(
        editModelOutputServer({
          "simulation-name": simulationName,
          "model-output-id": Number(modelOutputId),
          modelOutputData: addModelOutputMapper({
            formData: values,
            messageTypes,
            simulatedModels,
          }),
          redirect: () => {
            navigate(pages.modelOutputsList(simulationName));
            resetForm();
          },
        }),
      );
    } else {
      dispatch(
        addModelOutputServer({
          "simulation-name": simulationName,
          modelOutputData: addModelOutputMapper({
            formData: values,
            messageTypes,
            simulatedModels,
          }),
          redirect: () => {
            navigate(pages.modelOutputsList(simulationName));
            resetForm();
          },
        }),
      );
    }
  };

  const { values, errors, handleChange, setValues, touched, resetForm, submitForm } = useFormik({
    initialValues: modelOutputInitialState,
    // validationSchema: modelOutputModelSchema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    dispatch(getSimulationsServer({}));
    dispatch(getEnumeratorsServer());

    if (simulationName)
      dispatch(
        fetchModelOutputsListServer({
          "simulation-name": simulationName,
        }),
      );
  }, []);

  useEffect(() => {
    if (!simulationName) return;

    dispatch(
      fetchSimulatedSystemsServer({
        "simulation-name": simulationName,
      }),
    );

    dispatch(
      getSimulatedModelsServer({
        simulationName,
      }),
    );
  }, [simulationName]);

  useEffect(() => {
    if (!currentOutputModel) return;

    prefillForm();
  }, [currentOutputModel, messageTypes]);

  const prefillForm = () => {
    if (currentOutputModel && messageTypes) {
      setValues(
        modelOutputMapper({
          modelOutput: currentOutputModel,
          messageTypes,
          simulatedSystems,
        }),
      );
    }
  };

  const handleSelectChange = (key: keyof typeof modelOutputInitialState) => (value: string) => {
    setValues({ ...values, [key]: value });
  };

  const handleCheckboxChange = (key: keyof typeof modelOutputInitialState) => (value: boolean) => {
    setValues({ ...values, [key]: value });
  };

  const handleCancel = () => {
    navigate(pages.modelOutputsList(simulationName || "unknown"));
  };

  const getStructureName = (): string => {
    const modelClassName =
      simulatedModels.find((el) => el["model-full-path"] === values.modelFullPath)?.["model-class-name"] || "";
    const suffix = values.outputSuffix;
    const messageType = values.messageType;
    const POSTFIX = "Output";

    return `${modelClassName}${suffix}${messageType}${POSTFIX}`.replaceAll(" ", "");
  };

  useEffect(() => {
    dispatch(updateModelOutputsValidationErrors([]));
    const outputStructureName = getStructureName();

    setValues({ ...values, outputStructureName });
  }, [values.outputSuffix, values.messageType, values.modelFullPath]);

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Model Outputs", to: pages.modelOutputsList(simulationName ?? "") },
    { label: `${actionName} model output`, to: "" },
  ];

  return (
    <Wrapper>
      <Seo title={`${actionName} Model Output`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <SimulatedModelActionButtonsBlock onConfirm={submitForm} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!modelOutputsValidationErrors?.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {modelOutputsValidationErrors.map((error, index) => (
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
                value={values.modelFullPath}
                onChange={handleSelectChange("modelFullPath")}
                options={modelFullPaths}
                error={touched.modelFullPath && !!errors.modelFullPath}
              />
            </LongSelectWrapper>
          }
        />

        <MainContainer
          requireField
          title="Message type"
          content={
            <Select
              placeholder="Enter Message type"
              value={values.messageType}
              onChange={handleSelectChange("messageType")}
              options={messageTypesOptions}
              error={touched.messageType && !!errors.messageType}
            />
          }
        />

        <MainContainer
          title="Output Suffix"
          content={
            <Input
              placeholder="Enter Output Suffix"
              value={values.outputSuffix}
              handleChange={handleChange}
              formikName="outputSuffix"
              error={!!errors.outputSuffix}
            />
          }
        />

        <MainContainer
          title="Output Structure Name"
          content={
            <LongInputWrapper>
              <Input
                placeholder="Fill Output Structure Name"
                value={values.outputStructureName}
                handleChange={handleChange}
                formikName="outputStructureName"
              />
            </LongInputWrapper>
          }
        />

        <MainContainer
          title="Output Message Alias"
          content={
            <LongInputWrapper>
              <Input
                placeholder="Fill Output Message Alias"
                value={transformOutputAlias(values.outputStructureName)}
                handleChange={() => null}
                formikName="outputAlias"
              />
            </LongInputWrapper>
          }
        />

        {currentOutputModel && (
          <>
            <MainContainer
              title="Generic output identifier"
              content={
                <Typography variant="body2" color="main.100">
                  {currentOutputModel?.["generic-model-output-identifier"]}
                </Typography>
              }
            />
            <MainContainer
              title="Internal Id"
              content={
                <Typography variant="body2" color="main.100">
                  {currentOutputModel?.["model-output-id"]}
                </Typography>
              }
            />
            <MainContainer
              title="Creation Date"
              content={
                <Typography variant="body2" color="main.100">
                  {format(
                    parseISO(currentOutputModel?.["creation-date"] || new Date().toISOString()),
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
                    parseISO(currentOutputModel?.["last-update-date"] || new Date().toISOString()),
                    "yyyy-MM-dd HH:mm",
                  )}
                </Typography>
              }
            />
            <MainContainer
              title="# of models using"
              content={
                <Typography variant="body2" color="main.100">
                  {currentOutputModel?.["number-of-model-using-as-input"]}
                </Typography>
              }
            />
            <MainContainer
              title="Documentation"
              content={
                currentOutputModel?.["path-to-documentation"] ? (
                  <Typography variant="body2" color="main.100">
                    <a
                      href={currentOutputModel["path-to-documentation"]}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "underline" }}
                    >
                      {(() => {
                        const path = currentOutputModel["path-to-documentation"]; // e.g. "path/structSdsStructName.html"
                        const file = path.split("/").pop() || ""; // "structSdsStructName.html"
                        const noExt = file.replace(".html", ""); // "structSdsStructName"
                        const prefix = "struct";

                        if (noExt.startsWith(prefix)) {
                          const rest = noExt.slice(prefix.length); // "SdsStructName"
                          return `${rest} structure`; // "SdsStructName structure"
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

const ListWrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
});

const LongSelectWrapper = styled("div")({
  ".customSelect": {
    maxWidth: "none",
    minWidth: "500px !important",

    ".MuiInputBase-root": {
      width: "500px !important",
    },
  },
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

export default withSimulation(AddEditModelOutput);
