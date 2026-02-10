import { useDispatch } from "react-redux";
import { Grid, styled, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

import Seo from "../../components/Seo/Seo";
import React, { FC, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import Container from "../../components/WidgetContainer/WidgetContainer";
import withSimulation from "../../hocs/withSimulation";
import Input from "../../components/Inputs/Input";
import Select from "../../components/Select/Select";
import { pages } from "../../lib/routeUtils";
import { format, parseISO } from "date-fns";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { getServerNodes, getServerNodeValidationErrors } from "../../redux/reducers/serverNodesReducer";
import {
  addServerNodeServer,
  editServerNodeServer,
  getServerNodesServer,
  updateServerNodeValidationErrors,
} from "../../redux/actions/serverNodesActions";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { camelize } from "../../lib/camelize";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import { updateSimulationUserValidationErrors } from "../../redux/actions/simulationUsersActions";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
}

interface Props {
  isEditMode?: boolean;
}

const initialState = {
  simulationOwner: "",
  simulationServerNodeName: "",
  simulationRunMode: "",
  serverAgentIpAddress: "",
  serverAgentListeningPortNumber: "",
  apiServerIpAddress: "",
  apiServerPortNumber: "",
};

const AddEditServerNode = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { serverNodeId } = useParams();
  const navigate = useNavigate();
  const formPrefilledRef = useRef<boolean>(false);
  const serverNodes = useSelector(getServerNodes);
  const serverNodeValidationErrors = useSelector(getServerNodeValidationErrors);
  const enumerators = useSelector(getEnumerators);
  const simulations = useSelector(getSimulations);

  const actionName = isEditMode ? "Edit" : "Create";

  const [textFields, setTextFields] = useState<Record<string, string | number>>({
    simulationServerNodeName: initialState.simulationServerNodeName,
    serverAgentIpAddress: initialState.serverAgentIpAddress,
    serverAgentListeningPortNumber: initialState.serverAgentListeningPortNumber,
    apiServerIpAddress: initialState.apiServerIpAddress,
    apiServerPortNumber: initialState.apiServerPortNumber,
  });
  const [simulationOwner, setSimulationOwner] = useState<string>(initialState.simulationOwner);
  const [simulationRunMode, setSimulationRunMode] = useState<string>(initialState.simulationRunMode);
  const [isMissing, setIsMissing] = useState<Record<string, boolean>>({
    simulationServerNodeName: false,
    serverAgentIpAddress: false,
    serverAgentListeningPortNumber: false,
    apiServerIpAddress: false,
    apiServerPortNumber: false,
  });

  const currentNode = (serverNodes || []).find(
    (node) => Number(node["simulation-server-node-id"]) === Number(serverNodeId),
  );

  const simulationOwnerItems = simulations.map(
    (node) => node["simulation-name"] + " [" + node["simulation-owner-name"] + "]",
  );
  const simulationRunModeValues = enumerators?.find((enumerator) => enumerator["enum-type"] === "simulation-run-modes");
  const simulationRunModeItems = simulationRunModeValues
    ? simulationRunModeValues["enum-values"].map((value) => value["enum-value-string"])
    : [];

  const currentSimulationId = useMemo(() => {
    const simulationName = simulationOwner?.replace(/\[.*?\]/, "").trim();
    const simulation = simulations.find((simulation) => simulation["simulation-name"] === simulationName);

    return simulation?.["simulation-id"];
  }, [simulationOwner]);

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFields({ ...textFields, [e.target.name]: e.target.value });
    setIsMissing({ ...isMissing, [e.target.name]: !e.target.value });
  };

  useEffect(() => {
    dispatch(getEnumeratorsServer());
    dispatch(getServerNodesServer({}));
    dispatch(getSimulationsServer({}));
  }, []);

  useEffect(() => {
    if (
      isEditMode &&
      currentNode &&
      !!simulationOwnerItems.length &&
      !!simulationRunModeItems.length &&
      !formPrefilledRef.current
    ) {
      prefillForm();
      formPrefilledRef.current = true;
    }
  }, [isEditMode, currentNode, simulationOwnerItems, simulationRunModeItems]);

  useEffect(() => {
    if (!isEditMode && !!simulationOwnerItems.length && !!simulationRunModeItems.length && !formPrefilledRef.current) {
      setSimulationOwner(simulationOwnerItems[0]);
      setSimulationRunMode(simulationRunModeItems[0]);
      formPrefilledRef.current = true;
    }
  }, [isEditMode, simulationOwnerItems, simulationRunModeItems]);

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
    if (serverNodeValidationErrors.length) {
      serverNodeValidationErrors.forEach((field) => {
        field["form-field-name"] = camelize(field["form-field-name"]);

        setIsMissing((prevState) => ({
          ...prevState,
          [field["form-field-name"]]: true,
        }));
      });
    } else {
      resetAllErrors();
    }
  }, [serverNodeValidationErrors]);

  const clearForm = () => {
    setTextFields({
      simulationServerNodeName: initialState.simulationServerNodeName,
      serverAgentIpAddress: initialState.serverAgentIpAddress,
      serverAgentListeningPortNumber: initialState.serverAgentListeningPortNumber,
      apiServerIpAddress: initialState.apiServerIpAddress,
      apiServerPortNumber: initialState.apiServerPortNumber,
    });
    setSimulationOwner(initialState.simulationOwner);
    setSimulationRunMode(initialState.simulationRunMode);
  };

  const prefillForm = () => {
    if (currentNode) {
      const simulationRunMode = simulationRunModeItems.find(
        (_, index) => index + 1 === Number(currentNode["simulation-run-mode-id"]),
      );
      setTextFields({
        simulationServerNodeName: currentNode["simulation-server-node-name"],
        serverAgentIpAddress: currentNode["server-agent-ip-address"],
        serverAgentListeningPortNumber: currentNode["server-agent-listening-port-number"],
        apiServerIpAddress: currentNode["api-server-ip-address"],
        apiServerPortNumber: currentNode["api-server-port-number"],
      });
      setSimulationOwner(`${currentNode["simulation-name"]} [${currentNode["simulation-owner-name"]}]`);
      setSimulationRunMode(simulationRunMode as string);
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(pages.serverNodes());
  };

  const handleSubmit = () => {
    if (isEditMode) {
      dispatch(
        editServerNodeServer({
          "simulation-server-node-id": serverNodeId as string,
          "simulation-id": currentSimulationId as number,
          "simulation-server-node-name": textFields.simulationServerNodeName as string,
          "simulation-run-mode-id": String(
            simulationRunModeValues?.["enum-values"].find((el) => el["enum-value-string"] === simulationRunMode)?.[
              "enum-value-id"
            ],
          ),
          "server-agent-ip-address": textFields.serverAgentIpAddress as string,
          "server-agent-listening-port-number": textFields.serverAgentListeningPortNumber as string,
          "api-server-ip-address": textFields.apiServerIpAddress as string,
          "api-server-port-number": textFields.apiServerPortNumber as string,
          redirect: () => navigate(pages.serverNodes()),
        }),
      );
    } else {
      dispatch(
        addServerNodeServer({
          "simulation-id": currentSimulationId as number,
          "simulation-server-node-name": textFields.simulationServerNodeName as string,
          "simulation-run-mode-id": String(
            simulationRunModeValues?.["enum-values"].find((el) => el["enum-value-string"] === simulationRunMode)?.[
              "enum-value-id"
            ],
          ),
          "server-agent-ip-address": textFields.serverAgentIpAddress as string,
          "server-agent-listening-port-number": textFields.serverAgentListeningPortNumber as string,
          "api-server-ip-address": textFields.apiServerIpAddress as string,
          "api-server-port-number": textFields.apiServerPortNumber as string,
          redirect: () => navigate(pages.serverNodes()),
        }),
      );
    }
  };

  useEffect(() => {
    dispatch(updateServerNodeValidationErrors([]));
  }, []);

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Server nodes", to: pages.serverNodes() },
    { label: `${actionName} server node`, to: "" },
  ];

  return (
    <Wrapper>
      <Seo title={`${actionName} Server Node`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!serverNodeValidationErrors.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {serverNodeValidationErrors.map((error, index) => (
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
          content={<Select value={simulationOwner} onChange={setSimulationOwner} options={simulationOwnerItems} />}
        />
        <MainContainer
          requireField
          title="Server node name"
          content={
            <Input
              formikName="simulationServerNodeName"
              error={isMissing.simulationServerNodeName}
              placeholder="Enter server node name"
              value={textFields.simulationServerNodeName}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Simulation run mode"
          content={
            <Select value={simulationRunMode} onChange={setSimulationRunMode} options={simulationRunModeItems} />
          }
        />
        <MainContainer
          requireField
          title="Server agent IP address"
          content={
            <Input
              formikName="serverAgentIpAddress"
              error={isMissing.serverAgentIpAddress}
              placeholder="Enter server agent IP address"
              value={textFields.serverAgentIpAddress}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Server agent port number"
          content={
            <Input
              formikName="serverAgentListeningPortNumber"
              error={isMissing.serverAgentListeningPortNumber}
              placeholder="Enter server agent port number"
              value={textFields.serverAgentListeningPortNumber}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="API server IP address"
          content={
            <Input
              formikName="apiServerIpAddress"
              error={isMissing.apiServerIpAddress}
              placeholder="Enter API server IP address"
              value={textFields.apiServerIpAddress}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="API server port number"
          content={
            <Input
              formikName="apiServerPortNumber"
              error={isMissing.apiServerPortNumber}
              placeholder="Enter API server port number"
              value={textFields.apiServerPortNumber}
              handleChange={handleTextFieldChange}
            />
          }
        />
        {isEditMode && (
          <>
            <MainContainer
              title="Informations"
              content={
                <Typography variant="body2" color="main.100">
                  Internal Id: {currentNode?.["simulation-server-node-id"]}
                </Typography>
              }
            />
            <MainContainer
              title="Time Stamps"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Creation date:{" "}
                    {format(parseISO(currentNode?.["creation-date"] || new Date().toISOString()), "yyyy-MM-dd HH:mm")}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Last update date:{" "}
                    {format(
                      parseISO(currentNode?.["last-update-date"] || new Date().toISOString()),
                      "yyyy-MM-dd HH:mm",
                    )}
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

export default withSimulation(AddEditServerNode);
