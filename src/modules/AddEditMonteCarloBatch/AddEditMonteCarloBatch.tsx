import React, { ChangeEvent, FC, ReactElement, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { format, parseISO } from "date-fns";
import { useParams } from "react-router-dom";
import { Grid, styled, Typography } from "@mui/material";

import Seo from "../../components/Seo/Seo";
import Input from "../../components/Inputs/Input";
import Select from "../../components/Select/Select";
import withSimulation from "../../hocs/withSimulation";
import Container from "../../components/WidgetContainer/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { pages } from "../../lib/routeUtils";
import { camelize } from "../../lib/camelize";
import { getServerNodes } from "../../redux/reducers/serverNodesReducer";
import { getServerNodesServer } from "../../redux/actions/serverNodesActions";
import { getSimulationUsers } from "../../redux/reducers/simulationUsersReducer";
import { getSimulationUsersServer } from "../../redux/actions/simulationUsersActions";
import { getConfigurationFiles } from "../../redux/reducers/configurationFilesReducer";
import { getConfigurationFilesServer } from "../../redux/actions/configurationFilesActions";
import {
  addSimulationServer,
  editSimulationServer,
  updateSimulationValidationErrors,
} from "../../redux/actions/simulationActions";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import { getSimulationValidationErrors } from "../../redux/reducers/simulationReducer";
import { getUniqSelectItems } from "../../lib/getUniqSelectItems";
import CustomCheckbox from "../../components/Checkbox/Checkbox";
import MonteCarloBatchBreadcrumbs from "./componens/MonteCarloBatchBreadcrumbs";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
}

interface Props {
  isEditMode?: boolean;
}

const initialState = {
  simulationName: "",
  simulationOwner: "",
  project: "",
  status: "",
  simulationExecutablePath: "",
  simulationBaseFolderPath: "",
  simulationConfiguration: "",
  simulationServerNode: "",
  waitForGo: true,
  developSimOutputPath: "",
};

const AddEditMonteCarloBatch = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { simulationId } = useParams();
  const navigate = useNavigate();
  const formPrefilledRef = useRef<boolean>(false);
  const simulations = useSelector(getSimulations);
  const simulationValidationErrors = useSelector(getSimulationValidationErrors);
  const simulationUsers = useSelector(getSimulationUsers);
  const simulationUserConfigs = useSelector(getConfigurationFiles);
  const serverNodes = useSelector(getServerNodes);
  const enumerators = useSelector(getEnumerators);

  const currentSimulation = (simulations || []).find((node) => Number(node["simulation-id"]) === Number(simulationId));

  const projectValues = enumerators?.find((enumerator) => enumerator["enum-type"] === "projects");

  const projectItems = projectValues ? projectValues["enum-values"].map((value) => value["enum-value-string"]) : [];
  const statusValues = enumerators?.find((enumerator) => enumerator["enum-type"] === "simulation-statuses");

  // Get user-settable statuses only
  const userStatusItems = statusValues
    ? statusValues["enum-values"]
        .filter((value) => value["enum-value-id"] > 0 && value["enum-value-id"] < 100)
        .map((value) => value["enum-value-string"])
    : [];

  // For display in dropdown, include current status if it's system-assigned
  const displayStatusItems = (() => {
    if (!isEditMode || !currentSimulation) {
      return userStatusItems;
    }

    const currentStatus = currentSimulation["simulation-status"];
    if (userStatusItems.includes(currentStatus)) {
      // Current status is user-settable, just show user options
      return userStatusItems;
    } else {
      // Current status is system-assigned, add it to the display list but keep it at the top
      return [currentStatus, ...userStatusItems];
    }
  })();

  const statusItems = userStatusItems; // Keep this for backward compatibility in submit logic

  const simulationOwnerItems = getUniqSelectItems(simulationUsers, "user-name");
  const simulationConfigurationItems = Array.from(
    new Set(
      simulationUserConfigs
        .filter((config) => config["simulation-id"] === Number(simulationId))
        .map((config) => `${config["configuration-name"]} [${config["simulation-name"]}]`),
    ),
  );

  const simulationServerNodeItems = Array.from(
    new Set(
      serverNodes
        .filter((config) => config["simulation-id"] === Number(simulationId))
        .map((node) => `${node["simulation-server-node-name"]} [${node["simulation-name"]}]`),
    ),
  );

  const actionName = isEditMode ? "Edit" : "Create";

  const [textFields, setTextFields] = useState<Record<string, string | number>>({
    simulationName: initialState.simulationName,
    simulationExecutablePath: initialState.simulationExecutablePath,
    simulationBaseFolderPath: initialState.simulationBaseFolderPath,
    developSimOutputPath: initialState.developSimOutputPath,
  });
  const [simulationOwner, setSimulationOwner] = useState<string>(initialState.simulationOwner);
  const [project, setProject] = useState<string>(initialState.project);
  const [status, setStatus] = useState<string>(initialState.status);
  const [originalStatusId, setOriginalStatusId] = useState<string>("");
  const [simulationConfiguration, setSimulationConfiguration] = useState<string>(initialState.simulationConfiguration);
  const [simulationServerNode, setSimulationServerNode] = useState<string>(initialState.simulationServerNode);
  const [isMissing, setIsMissing] = useState<Record<string, boolean>>({
    simulationName: false,
    simulationExecutablePath: false,
    simulationBaseFolderPath: false,
    developSimOutputPath: false,
  });
  const [waitForGo, setWaitForGo] = useState<boolean>(initialState.waitForGo);

  const isAllDataExist =
    !!simulationOwnerItems.length &&
    !!projectItems.length &&
    !!userStatusItems.length &&
    !!simulationConfigurationItems.length &&
    !!simulationServerNodeItems.length;

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFields({ ...textFields, [e.target.name]: e.target.value });
    setIsMissing({ ...isMissing, [e.target.name]: !e.target.value });
  };

  useEffect(() => {
    dispatch(getEnumeratorsServer());
    dispatch(getSimulationUsersServer({}));
    dispatch(getServerNodesServer({}));
    dispatch(getSimulationsServer({}));
    dispatch(getConfigurationFilesServer({}));
  }, []);

  useEffect(() => {
    if (isEditMode && currentSimulation && isAllDataExist && !formPrefilledRef.current) {
      prefillForm();
      formPrefilledRef.current = true;
    }
  }, [
    isEditMode,
    currentSimulation,
    simulationOwnerItems,
    projectItems,
    userStatusItems,
    simulationConfigurationItems,
    simulationServerNodeItems,
  ]);

  useEffect(() => {
    if (!isEditMode && isAllDataExist && !formPrefilledRef.current) {
      setSimulationOwner(simulationOwnerItems[0]);
      setProject(projectItems[0]);
      setStatus(userStatusItems[0]);
      setSimulationConfiguration(simulationConfigurationItems[0]);
      setSimulationServerNode(simulationServerNodeItems[0]);
      formPrefilledRef.current = true;
    }
  }, [
    isEditMode,
    simulationOwnerItems,
    projectItems,
    userStatusItems,
    simulationConfigurationItems,
    simulationServerNodeItems,
  ]);

  const resetAllErrors = () => {
    const newMissing = Object.keys(isMissing).reduce((acc, curr) => {
      return {
        ...acc,
        [curr]: false,
      };
    }, {});
    setIsMissing(newMissing);
  };

  useEffect(() => {
    if (simulationValidationErrors.length) {
      simulationValidationErrors.forEach((field) => {
        field["form-field-name"] = camelize(field["form-field-name"]);

        setIsMissing((prevState) => ({
          ...prevState,
          [field["form-field-name"]]: true,
        }));
      });
    } else {
      resetAllErrors();
    }
  }, [simulationValidationErrors]);

  const clearForm = () => {
    setTextFields({
      simulationName: initialState.simulationName,
      simulationExecutablePath: initialState.simulationExecutablePath,
      simulationBaseFolderPath: initialState.simulationBaseFolderPath,
      developSimOutputPath: initialState.developSimOutputPath,
    });
    setSimulationOwner(initialState.simulationOwner);
    setProject(initialState.project);
    setStatus(initialState.status);
    setOriginalStatusId("");
    setSimulationConfiguration(initialState.simulationConfiguration);
    setSimulationServerNode(initialState.simulationServerNode);
    setWaitForGo(true);
  };

  const prefillForm = () => {
    if (currentSimulation) {
      const project = projectItems.find((_, index) => index + 1 === Number(currentSimulation["project-id"]));
      const config = simulationUserConfigs.find(
        (config) =>
          Number(config["simulation-user-config-id"]) === Number(currentSimulation["simulation-user-config-id"]),
      );
      const serverNode = serverNodes.find(
        (node) => Number(node["simulation-server-node-id"]) === Number(currentSimulation["simulation-server-node-id"]),
      );
      setTextFields({
        simulationName: currentSimulation["simulation-name"],
        simulationExecutablePath: currentSimulation["simulation-executable-path"],
        simulationBaseFolderPath: currentSimulation["simulation-base-folder-path"],
        developSimOutputPath: currentSimulation["develop-simulation-output-folder-path"],
      });
      setSimulationOwner(currentSimulation["simulation-owner-name"]);
      setProject(project as string);
      setStatus(currentSimulation["simulation-status"]);
      setOriginalStatusId(currentSimulation["simulation-status-id"]);
      setSimulationConfiguration(`${config?.["configuration-name"]} [${config?.["simulation-name"]}]`);
      setSimulationServerNode(`${serverNode?.["simulation-server-node-name"]} [${serverNode?.["simulation-name"]}]`);
      setWaitForGo(currentSimulation["wait-for-go-when-launching"]);
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(pages.simulationCatalogue());
  };

  const handleSubmit = () => {
    const simulation = simulationUsers.find((user) => user["user-name"] === simulationOwner);
    const projectIndex = projectItems.findIndex((item) => item === project);

    // Determine the status ID to use
    let statusId: string;
    if (
      isEditMode &&
      currentSimulation &&
      status === currentSimulation["simulation-status"] &&
      !userStatusItems.includes(status)
    ) {
      // User didn't change the system-assigned status, keep original
      statusId = originalStatusId;
    } else {
      // User selected a user-settable status or it's a new simulation
      const statusIndex = userStatusItems.findIndex((item) => item === status);
      statusId = String(statusIndex + 1);
    }

    const config = simulationUserConfigs.find(
      (config) => config["configuration-name"] + " [" + config["simulation-name"] + "]" === simulationConfiguration,
    );
    const serverNode = serverNodes.find(
      (node) => node["simulation-server-node-name"] + " [" + node["simulation-name"] + "]" === simulationServerNode,
    );

    if (isEditMode) {
      dispatch(
        editSimulationServer({
          "simulation-id": Number(simulationId),
          "simulation-name": textFields.simulationName as string,
          "simulation-owner-id": simulation?.["user-id"] as string,
          "project-id": String(projectIndex + 1),
          "simulation-status-id": statusId,
          "simulation-executable-path": textFields.simulationExecutablePath as string,
          "simulation-base-folder-path": textFields.simulationBaseFolderPath as string,
          "simulation-user-config-id": config?.["simulation-user-config-id"] as number,
          "simulation-server-node-id": parseInt(serverNode?.["simulation-server-node-id"] as string),
          "wait-for-go-when-launching": waitForGo,
          "develop-simulation-output-folder-path": textFields.developSimOutputPath as string,
          redirect: () => navigate("/simulation-catalogue"),
        }),
      );
    } else {
      dispatch(
        addSimulationServer({
          "simulation-name": textFields.simulationName as string,
          "simulation-owner-id": simulation?.["user-id"] as string,
          "project-id": String(projectIndex + 1),
          "simulation-status-id": statusId,
          "simulation-executable-path": textFields.simulationExecutablePath as string,
          "simulation-base-folder-path": textFields.simulationBaseFolderPath as string,
          "simulation-user-config-id": 0,
          "simulation-server-node-id": 0,
          "wait-for-go-when-launching": waitForGo,
          "develop-simulation-output-folder-path": textFields.developSimOutputPath as string,
          redirect: () => navigate("/simulation-catalogue"),
        }),
      );
    }
  };

  useEffect(() => {
    dispatch(updateSimulationValidationErrors([]));
  }, []);

  const handleUploadFilePath = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const filePath = e.target.value;
    if (!filePath) return;

    setTextFields({ ...textFields, [key]: filePath });
    e.target.value = null as any;
  };

  return (
    <Wrapper>
      <Seo title={`${actionName} Simulation`} />
      <Container
        breadcrumbs={<MonteCarloBatchBreadcrumbs actionName={actionName} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!simulationValidationErrors.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {simulationValidationErrors.map((error, index) => (
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
            <Input
              formikName="simulationName"
              error={isMissing.simulationName}
              placeholder="Enter simulation name"
              value={textFields.simulationName}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Simulation Owner"
          content={<Select value={simulationOwner} onChange={setSimulationOwner} options={simulationOwnerItems} />}
        />
        <MainContainer
          requireField
          title="Project"
          content={<Select value={project} onChange={setProject} options={projectItems} />}
        />
        <MainContainer
          requireField
          title="Status"
          content={<Select value={status} onChange={setStatus} options={displayStatusItems} />}
        />
        <InputsWrapper>
          <MainContainer
            requireField
            title="Simulation executable file path"
            content={
              <Input
                formikName="simulationExecutablePath"
                error={isMissing.simulationExecutablePath}
                placeholder="Enter simulation executable file path"
                value={textFields.simulationExecutablePath}
                handleChange={handleTextFieldChange}
              />
            }
          />
        </InputsWrapper>

        <InputsWrapper>
          <MainContainer
            requireField
            title="Simulation root folder"
            content={
              <Input
                formikName="simulationBaseFolderPath"
                error={isMissing.simulationBaseFolderPath}
                placeholder="Enter deployment templates root folder"
                value={textFields.simulationBaseFolderPath}
                handleChange={handleTextFieldChange}
              />
            }
          />
        </InputsWrapper>

        <InputsWrapper>
          <MainContainer
            requireField
            title="Develop simulations output path"
            content={
              <Input
                formikName="developSimOutputPath"
                error={isMissing.developSimOutputPath}
                placeholder="Enter develop simulations output path"
                value={textFields.developSimOutputPath}
                handleChange={handleTextFieldChange}
              />
            }
          />
        </InputsWrapper>

        {isEditMode && (
          <MainContainer
            requireField
            title="Simulation configuration"
            content={
              <LongSelectWrapper>
                <Select
                  value={simulationConfiguration}
                  onChange={setSimulationConfiguration}
                  options={simulationConfigurationItems}
                />
              </LongSelectWrapper>
            }
          />
        )}
        {isEditMode && (
          <MainContainer
            requireField
            title="Simulation server node"
            content={
              <LongSelectWrapper>
                <Select
                  value={simulationServerNode}
                  onChange={setSimulationServerNode}
                  options={simulationServerNodeItems}
                />
              </LongSelectWrapper>
            }
          />
        )}
        <MainContainer
          title="Wait for GO when launching"
          content={<CustomCheckbox isChecked={waitForGo} onChange={setWaitForGo} />}
        />
        {isEditMode && (
          <>
            <MainContainer
              title="Informations"
              content={
                <Typography variant="body2" color="main.100">
                  Internal Id: {currentSimulation?.["simulation-id"]}
                </Typography>
              }
            />
            <MainContainer
              title="Time Stamps"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Creation date:{" "}
                    {format(
                      parseISO(currentSimulation?.["creation-date"] || new Date().toISOString()),
                      "yyyy-MM-dd HH:mm",
                    )}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Last update date:{" "}
                    {format(
                      parseISO(currentSimulation?.["last-update-date"] || new Date().toISOString()),
                      "yyyy-MM-dd HH:mm",
                    )}
                  </Typography>
                </Grid>
              }
            />
            <MainContainer
              title="Additional Information"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Selected server agent: {currentSimulation?.["server-agent-ip-address"]}:
                    {currentSimulation?.["server-agent-listening-port-number"]}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Selected API server: {currentSimulation?.["api-server-ip-address"]}:
                    {currentSimulation?.["api-server-port-number"]}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Selected user configuration file: {simulationConfiguration.split("[")[0] || ""}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Selected default initial conditions file: {currentSimulation?.["default-initial-conditions-name"]}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Selected override initial conditions file: {currentSimulation?.["initial-conditions-overide-name"]}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Selected scenario file: {currentSimulation?.["scenario-file-name"]}
                  </Typography>
                </Grid>
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
      width: "100% !important",
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
    minWidth: "500px",

    "@media(max-width: 1200px)": {
      minWidth: "385px",
    },
  },
});

const InputsWrapper = styled("div")({
  marginTop: "5px",
  borderBottom: "1px solid #1F1F22",

  "& > div": {
    ".MuiInputBase-root": {
      width: "800px !important",
      maxWidth: "100%",

      "@media (max-width: 1500px)": {
        width: "700px !important",
      },

      "@media (max-width: 1400px)": {
        width: "800px !important",
      },

      "@media (max-width: 1300px)": {
        width: "700px !important",
      },
    },
  },
});

const UploadInput = styled("input")`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  opacity: 0;
  cursor: pointer;
`;

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

export default withSimulation(AddEditMonteCarloBatch);
