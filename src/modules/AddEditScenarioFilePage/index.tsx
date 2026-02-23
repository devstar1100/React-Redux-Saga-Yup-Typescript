import { Grid, Typography, styled } from "@mui/material";
import Container from "../../components/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { pages } from "../../lib/routeUtils";
import { useNavigate, useParams } from "react-router";
import { FC, ReactElement, useEffect, useMemo, useState } from "react";
import withSimulation from "../../hocs/withSimulation";
import Select from "../../components/Select";
import { useSelector } from "react-redux";
import Input from "../../components/Inputs";
import { editScenarioInitialState, editScenarioInitialErrorsState } from "./lib/formInitialState";
import { useDispatch } from "react-redux";
import { getConfigurationFilesServer } from "../../redux/actions/configurationFilesActions";
import Alert, { AlertVariant } from "../../components/Alert";
import { formatDate, timePattern2 } from "../../lib/dateUtils";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getCurrentScenarioFiles, getScenarioFilesValidationErrors } from "../../redux/reducers/scenarioFilesReducer";
import { ScenarioFile } from "../../types/scenarioFile";
import {
  addEditScenarioFileServer,
  updateScenarioFilesValidationErrors,
} from "../../redux/actions/scenarioFilesActions";
import { manageScenarioFileDto } from "./lib/manageScenario.dto";
import { EnumValue, SimulationEnumType } from "../../types/simulations";
import { getSimDependantPageFullLink } from "../../lib/simulationConfigurationUtils";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";

enum PageMode {
  "create" = "create",
  "edit" = "edit",
}

interface FieldConfig {
  key: keyof ScenarioFile;
  label: string;
  requireField: boolean;
  placeholder: string;
  size?: number;
}

interface NonEditableData {
  key: keyof ScenarioFile;
  label: string;
  mode?: PageMode;
  formatter?(value: string): string;
}

const fieldConfigs: FieldConfig[] = [
  {
    key: "scenario-file-name",
    label: "Scenario file name",
    requireField: true,
    placeholder: "Enter file name",
    size: 256,
  },
];

const nonEditableInfoConfigs: NonEditableData[] = [
  {
    key: "scenario-file-folder",
    label: "Scenario file folder",
    mode: PageMode.edit,
  },
  {
    key: "total-number-of-events",
    label: "Number of events",
    mode: PageMode.edit,
  },
  {
    key: "total-number-of-lines",
    label: "Total number of lines",
    mode: PageMode.edit,
  },
  {
    key: "scenario-file-id",
    label: "Internal Id",
    mode: PageMode.edit,
  },
  {
    key: "creation-date",
    label: "Creation date",
    formatter: (value: string) => formatDate(value, timePattern2),
    mode: PageMode.edit,
  },
  {
    key: "last-update-date",
    label: "Last update date",
    formatter: (value: string) => formatDate(value, timePattern2),
    mode: PageMode.edit,
  },
];

interface Props {
  pageMode: PageMode;
}

const AddEditScenarioFilePage: FC<Props> = ({ pageMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { simulationId: simIdStr, sessionId: sessionIdStr, fileId } = useParams();

  const simulationId = Number(simIdStr);
  const sessionId = Number(sessionIdStr);

  const scenarioFiles = useSelector(getCurrentScenarioFiles);
  const simulations = useSelector(getSimulations);
  const enumerators = useSelector(getEnumerators);

  const scenarioFileValidationErrors = useSelector(getScenarioFilesValidationErrors);

  const [formData, setFormData] = useState<ScenarioFile>(editScenarioInitialState);
  const [errors, setErrors] = useState<Record<keyof ScenarioFile, string>>(editScenarioInitialErrorsState);

  const isEditMode = pageMode === "edit";
  const actionName = isEditMode ? "Edit" : "Create";

  const currentFile = useMemo(
    () => scenarioFiles.find((file) => file["scenario-file-id"] === Number(fileId)),
    [scenarioFiles],
  );

  const selectSubItems = useMemo(
    () => simulations.map((el) => `${el["simulation-name"]} [${el["simulation-owner-name"]}]`),
    [simulations],
  );

  const timeRepresentationTypesOptions = useMemo(() => {
    const values = enumerators?.find((enumerator) => enumerator["enum-type"] === "scenario-time-representation");

    const timeRepresentationTypesOptions = values
      ? values["enum-values"].map((value) => value["enum-value-string"])
      : [];

    return timeRepresentationTypesOptions;
  }, [enumerators]);

  const currentSimulationId = useMemo(() => {
    const simulationName = formData["simulation-owner-name"]?.replace(/\[.*?\]/, "").trim();
    const simulation = simulations.find((simulation) => simulation["simulation-name"] === simulationName);

    return simulation?.["simulation-id"] || 0;
  }, [formData]);

  const handleSubmit = () => {
    const redirect = () =>
      navigate(getSimDependantPageFullLink({ baseRoute: pages.scenarioFiles(), simulationId, sessionId }));

    const timeRepresentations = enumerators?.find(
      (enumerator) => enumerator["enum-type"] === "scenario-time-representation",
    ) as SimulationEnumType;

    const timeRepresentationEnum = (
      timeRepresentations["enum-values"].find(
        (rep) => rep["enum-value-string"] === formData["time-representation"],
      ) as EnumValue
    )["enum-value-id"];

    if (isEditMode && fileId) {
      dispatch(
        addEditScenarioFileServer({
          actionType: "edit",
          scenarioFileId: +fileId,
          scenarioFile: manageScenarioFileDto(formData, currentSimulationId, timeRepresentationEnum),
          redirect,
          successMessage: "File successfully edited",
        }),
      );
    } else if (!isEditMode) {
      dispatch(
        addEditScenarioFileServer({
          actionType: "add",
          scenarioFileId: 0,
          scenarioFile: manageScenarioFileDto(formData, currentSimulationId, timeRepresentationEnum),
          redirect,
          successMessage: "File successfully added",
        }),
      );
    }
  };

  const handleSelectChange = (key: keyof ScenarioFile) => (newValue: string) => {
    setFormData({ ...formData, [key]: newValue });
  };

  const clearForm = () => {
    setFormData(editScenarioInitialState);
    setErrors(editScenarioInitialErrorsState);
  };

  const prefillForm = () => {
    if (currentFile) {
      const simulationOwnerName = `${currentFile["simulation-name"]} [${currentFile["simulation-owner-name"]}]`;
      setFormData({ ...currentFile, "simulation-owner-name": simulationOwnerName });
      setErrors(editScenarioInitialErrorsState);
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(getSimDependantPageFullLink({ baseRoute: pages.scenarioFiles(), simulationId, sessionId }));
  };

  const handleInputChange = (field: keyof ScenarioFile, size?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let error = "";

    if (size && size < value.length) {
      setErrors({ ...errors, [field]: `Maximum length ${size} characters` });
      return;
    }

    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: error });
  };

  useEffect(() => {
    dispatch(getConfigurationFilesServer({}));
    dispatch(getSimulationsServer({}));
    dispatch(getEnumeratorsServer());
  }, []);

  useEffect(() => {
    prefillForm();
  }, [currentFile]);

  useEffect(() => {
    if (currentFile) {
      const simulationOwnerName = `${currentFile["simulation-name"]} [${currentFile["simulation-owner-name"]}]`;
      setFormData((prev) => ({ ...prev, "simulation-owner-name": simulationOwnerName }));
    } else if (selectSubItems) {
      setFormData((prev) => ({ ...prev, "simulation-owner-name": selectSubItems[0] }));
    }
  }, [selectSubItems, currentFile]);

  useEffect(() => {
    dispatch(updateScenarioFilesValidationErrors([]));
  }, []);

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Scenario files", to: `${pages.scenarioFiles()}/${simulationId}/${sessionId}` },
    { label: `${actionName} scenario file`, to: "" },
  ];

  return (
    <Wrapper>
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!scenarioFileValidationErrors?.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {scenarioFileValidationErrors.map((error, index) => (
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
          title="Simulation"
          content={
            <Select
              value={formData["simulation-owner-name"]}
              onChange={handleSelectChange("simulation-owner-name")}
              options={selectSubItems}
              excludeOptions={isEditMode ? [currentFile?.["simulation-owner-name"] || ""] : []}
            />
          }
        />
        {fieldConfigs.map((config) => (
          <MainContainer
            key={config.key}
            requireField={config.requireField}
            title={config.label}
            content={
              <Input
                error={
                  !!errors[config.key] ||
                  !!scenarioFileValidationErrors.find((error) => error["form-field-name"] === config.key)
                }
                helperText={errors[config.key] ? errors[config.key] : ""}
                placeholder={config.placeholder}
                value={formData[config.key]}
                handleChange={handleInputChange(config.key, config.size)}
              />
            }
          />
        ))}
        <MainContainer
          requireField
          title="Time representation"
          content={
            <Select
              value={formData["time-representation"]}
              onChange={handleSelectChange("time-representation")}
              options={timeRepresentationTypesOptions || []}
            />
          }
        />
        {nonEditableInfoConfigs.map((config) => {
          if (config.mode && config.mode !== pageMode) return;
          const data = (currentFile?.[config.key] || formData[config.key])?.toString();
          const renderData = config.formatter ? config.formatter(data) : data;

          return (
            <MainContainer
              key={config.key}
              title={config.label}
              content={
                <Typography variant="body2" color="main.100">
                  {renderData}
                </Typography>
              }
            />
          );
        })}
      </Container>
    </Wrapper>
  );
};

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
}

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

export default withSimulation(AddEditScenarioFilePage);
