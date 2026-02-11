import { Grid, Typography, styled } from "@mui/material";
import Container from "../../components/WidgetContainer/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { pages } from "../../lib/routeUtils";
import { useNavigate, useParams } from "react-router";
import { ChangeEvent, FC, ReactElement, useEffect, useMemo, useState } from "react";
import withSimulation from "../../hocs/withSimulation";
import Select from "../../components/Select";
import { useSelector } from "react-redux";
import { getConfigFileValidationErrors, getConfigurationFiles } from "../../redux/reducers/configurationFilesReducer";
import Input from "../../components/Inputs/Input";
import { ConfigurationFile } from "../../types/configurationFile";
import { editConfigurationInitialErrorsState, editConfigurationInitialState } from "./lib/formInitialState";
import { useDispatch } from "react-redux";
import {
  addConfigurationFileServer,
  editConfigurationFileServer,
  getConfigurationFilesServer,
  updateConfigFileValidationErrors,
} from "../../redux/actions/configurationFilesActions";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import { formatDate, timePattern2 } from "../../lib/dateUtils";
import { getSimulationsServer } from "../../redux/actions/simulationsActions";
import { getSimulations } from "../../redux/reducers/simulationsReducer";
import { getCurrentScenarioFiles } from "../../redux/reducers/scenarioFilesReducer";
import { getScenarioFilesServer } from "../../redux/actions/scenarioFilesActions";
import { UploadIcon } from "../../components/Icons/UploadIcon";
import { toast } from "react-toastify";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";

enum PageMode {
  "create" = "create",
  "edit" = "edit",
}

interface FieldConfig {
  key: keyof ConfigurationFile;
  label: string;
  requireField: boolean;
  placeholder: string;
  size?: number;
  isUploadingField?: boolean;
}

interface NonEditableData {
  key: keyof ConfigurationFile;
  label: string;
  mode?: PageMode;
  formatter?(value: string): string;
}

const fieldConfigs: FieldConfig[] = [
  {
    key: "configuration-name",
    label: "Configuration name",
    requireField: true,
    placeholder: "Enter configuration name",
    size: 128,
  },
  {
    key: "user-config-file-name",
    label: "User configuration file",
    requireField: true,
    placeholder: "Enter file name",
    size: 256,
    isUploadingField: true,
  },
  {
    key: "default-initial-conditions-name",
    label: "Default initial conditions file",
    requireField: true,
    placeholder: "Enter default initial conditions",
    size: 256,
    isUploadingField: true,
  },
  {
    key: "initial-conditions-overide-name",
    label: "Override initial conditions file",
    requireField: true,
    placeholder: "Enter override initial conditions",
    size: 256,
    isUploadingField: true,
  },
  {
    key: "pod-identifier",
    label: "Pod Identifier",
    requireField: false,
    placeholder: "Enter identifier",
    size: 128,
  },
  {
    key: "pod-deployment-file-name",
    label: "Pod deployment file YAML",
    requireField: false,
    placeholder: "Enter file name",
    size: 128,
  },
  {
    key: "pod-deployment-namespace",
    label: "Pod deployment namespace",
    requireField: false,
    placeholder: "Enter namespace",
    size: 128,
  },
  {
    key: "containers-repository-path",
    label: "Containers repository Path",
    requireField: false,
    placeholder: "Enter path",
    size: 128,
  },
];

const nonEditableInfoConfigs: NonEditableData[] = [
  {
    key: "simulation-user-config-id",
    label: "Simulation user config id",
    mode: PageMode.edit,
  },
  {
    key: "creation-date",
    label: "Creation date",
    formatter: (value: string) => formatDate(value, timePattern2),
  },
  {
    key: "last-update-date",
    label: "Last update date",
    mode: PageMode.edit,
    formatter: (value: string) => formatDate(value, timePattern2),
  },
  {
    key: "path-to-documentation",
    label: "Documentation",
    mode: PageMode.edit,
    formatter: (value: string) =>
      value ? `<a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a>` : "Not provided",
  },
];

interface Props {
  pageMode: PageMode;
}

const AddConfigurationFile: FC<Props> = ({ pageMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { fileId } = useParams();

  const configurationFiles = useSelector(getConfigurationFiles);
  const simulations = useSelector(getSimulations);
  const scenarioFiles = useSelector(getCurrentScenarioFiles);
  const configFileValidationErrors = useSelector(getConfigFileValidationErrors);

  const [formData, setFormData] = useState<ConfigurationFile>(editConfigurationInitialState);
  const [errors, setErrors] = useState<Record<keyof ConfigurationFile, string>>(editConfigurationInitialErrorsState);

  const isEditMode = pageMode === "edit";
  const actionName = isEditMode ? "Edit" : "Create";

  const currentFile = useMemo(
    () => configurationFiles.find((file) => file["simulation-user-config-id"] === Number(fileId)),
    [configurationFiles],
  );

  const selectSubItems = useMemo(
    () => simulations.map((el) => `${el["simulation-name"]} [${el["simulation-owner-name"]}]`),
    [simulations],
  );

  const scenarioFileOptions = useMemo(
    () => [
      "Not defined",
      ...scenarioFiles
        .filter(
          (el) => `${el["simulation-name"]} [${el["simulation-owner-name"]}]` === formData["simulation-owner-name"],
        )
        .map((el) => el["scenario-file-name"]),
    ],
    [scenarioFiles, formData],
  );

  const currentSimulationId = useMemo(() => {
    const simulationName = formData["simulation-owner-name"]?.replace(/\[.*?\]/, "").trim();
    const simulation = simulations.find((simulation) => simulation["simulation-name"] === simulationName);

    return simulation?.["simulation-id"];
  }, [formData]);

  const selectedScenarioId = useMemo(() => {
    const id = Number(
      scenarioFiles.find((el) => el["scenario-file-name"] === formData["scenario-file-name"])?.["scenario-file-id"],
    );
    return isNaN(id) ? "" : id;
  }, [scenarioFiles, formData]);

  const handleSubmit = () => {
    const redirect = () => navigate(pages.configurationFiles());
    // deprecated custom validation
    // const requiredInputKeys = fieldConfigs.filter((field) => field.requireField).map((field) => field.key);
    // const requiredFieldsKeys: (keyof ConfigurationFile)[] = [...requiredInputKeys, "simulation-owner-name"];
    // const isRequiredFieldFilled = requiredFieldsKeys.every((key) => !!formData[key]);

    // if (!isRequiredFieldFilled) {
    //   toast.error("All required fields must be filled");
    //   return;
    // }
    if (isEditMode) {
      dispatch(
        editConfigurationFileServer({
          ...formData,
          "simulation-id": currentSimulationId as number,
          "scenario-file-id": selectedScenarioId,
          redirect,
        }),
      );
    } else {
      dispatch(
        addConfigurationFileServer({
          ...formData,
          "simulation-id": currentSimulationId as number,
          "scenario-file-id": selectedScenarioId,
          redirect,
        }),
      );
    }
  };

  const handleSimulationChange = (newValue: string) => {
    setFormData({ ...formData, "simulation-owner-name": newValue });
  };

  const handleScenarioChange = (newValue: string) => {
    setFormData({ ...formData, "scenario-file-name": newValue });
  };

  const clearForm = () => {
    setFormData(editConfigurationInitialState);
    setErrors(editConfigurationInitialErrorsState);
  };

  const prefillForm = () => {
    if (currentFile) {
      const simulationOwnerName = `${currentFile["simulation-name"]} [${currentFile["simulation-owner-name"]}]`;
      setFormData({ ...currentFile, "simulation-owner-name": simulationOwnerName });
      setErrors(editConfigurationInitialErrorsState);
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(pages.configurationFiles());
  };

  const handleInputChange =
    (field: keyof ConfigurationFile, size?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      let error = "";

      if (size && size < value.length) {
        setErrors({ ...errors, [field]: `Maximum length ${size} characters` });
        return;
      }

      setFormData({ ...formData, [field]: value });
      setErrors({ ...errors, [field]: error });
    };

  const handleUploadFileName = (key: keyof ConfigurationFile) => (e: ChangeEvent<HTMLInputElement>) => {
    const fileName = e.target.files?.[0].name;
    if (!fileName) return;

    setFormData({ ...formData, [key]: fileName });
    e.target.value = null as any;
  };

  const handleUploadFileNameOptions =
    (key: keyof ConfigurationFile, options: string[]) => (e: ChangeEvent<HTMLInputElement>) => {
      const fileName = e.target.files?.[0].name;
      if (!fileName) return;

      const currentOption = options.find((option) => option === fileName);
      if (!currentOption) {
        toast.error("No such file");
        return;
      }

      setFormData({ ...formData, [key]: currentOption });
    };

  useEffect(() => {
    dispatch(getConfigurationFilesServer({}));
    dispatch(getSimulationsServer({}));
    dispatch(getScenarioFilesServer());
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
    dispatch(updateConfigFileValidationErrors([]));
  }, []);

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Configuration files", to: pages.configurationFiles() },
    { label: `${actionName} simulation configuration file`, to: "" },
  ];

  return (
    <Wrapper>
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!configFileValidationErrors?.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {configFileValidationErrors.map((error, index) => (
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
          key={fieldConfigs[0].key}
          requireField={fieldConfigs[0].requireField}
          title={fieldConfigs[0].label}
          content={
            <Input
              error={
                !!errors[fieldConfigs[0].key] ||
                !!configFileValidationErrors.find((error) => error["form-field-name"] === fieldConfigs[0].key)
              }
              helperText={errors[fieldConfigs[0].key] ? errors[fieldConfigs[0].key] : ""}
              placeholder={fieldConfigs[0].placeholder}
              value={formData[fieldConfigs[0].key]}
              handleChange={handleInputChange(fieldConfigs[0].key, fieldConfigs[0].size)}
            />
          }
        />
        <MainContainer
          requireField
          title="Simulation"
          content={
            <Select
              value={formData["simulation-owner-name"]}
              onChange={handleSimulationChange}
              options={selectSubItems}
              excludeOptions={isEditMode ? [currentFile?.["simulation-owner-name"] || ""] : []}
            />
          }
        />
        <MainContainer
          title="Scenario file"
          content={
            <Select
              value={formData["scenario-file-name"]}
              placeholder=""
              onChange={handleScenarioChange}
              options={scenarioFileOptions}
            />
          }
        />
        {fieldConfigs.slice(1).map((config) => (
          <MainContainer
            key={config.key}
            requireField={config.requireField}
            title={config.label}
            content={
              <Input
                error={
                  !!errors[config.key] ||
                  !!configFileValidationErrors.find((error) => error["form-field-name"] === config.key)
                }
                helperText={errors[config.key] ? errors[config.key] : ""}
                placeholder={config.placeholder}
                value={formData[config.key]}
                handleChange={handleInputChange(config.key, config.size)}
                InputProps={{
                  endAdornment: config.isUploadingField && (
                    <UploadWrapper>
                      <UploadIcon />
                      <UploadInput onChange={handleUploadFileName(config.key)} type="file" />
                    </UploadWrapper>
                  ),
                }}
              />
            }
          />
        ))}
        {nonEditableInfoConfigs.map((config) => {
          if (config.mode && config.mode !== pageMode) return;
          const data = (currentFile?.[config.key] || formData[config.key]).toString();
          const renderData = config.formatter ? config.formatter(data) : data;

          // Special rendering for documentation link
          if (config.key === "path-to-documentation") {
            return (
              <MainContainer
                key={config.key}
                title={config.label}
                content={
                  <Typography
                    variant="body2"
                    color="main.100"
                    component="span"
                    dangerouslySetInnerHTML={{ __html: renderData }}
                  />
                }
              />
            );
          }

          return (
            <MainContainer
              key={config.key}
              title={config.label}
              content={
                <Typography variant="body2" color="main.100">
                  {config.label}: {renderData}
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

const UploadWrapper = styled("div")`
  z-index: 10;
  position: absolute;
  right: 14px;
  top: 4px;
  cursor: pointer;

  svg {
    width: 24px;
    pointer-events: none;

    path {
      stroke: #fff;
    }
  }

  @media (max-width: 1200px) {
    top: -4px;

    svg {
      width: 14px;

      path {
        stroke: #fff;
      }
    }
  }
`;

const UploadInput = styled("input")`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
`;

const SelectUpload = styled("div")`
  position: relative;

  svg {
    z-index: 10;
    width: 24px;
    pointer-events: none;
    cursor: pointer;

    path {
      stroke: #fff;
    }
  }

  @media (max-width: 1200px) {
    top: -4px;

    svg {
      width: 14px;

      path {
        stroke: #fff;
      }
    }
  }
`;

export default withSimulation(AddConfigurationFile);
