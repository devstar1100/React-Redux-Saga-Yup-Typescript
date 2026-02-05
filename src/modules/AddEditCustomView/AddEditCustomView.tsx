import { useDispatch } from "react-redux";
import { Grid, styled, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";

import Seo from "../../components/Seo/Seo";
import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import Container from "../../components/WidgetContainer/WidgetContainer";
import CustomBreadcrumbs from "./components/CustomBreadcrumbs";
import withSimulation from "../../hocs/withSimulation";
import Input from "../../components/Inputs/Input";
import GridTemplate from "./components/GridTemplate";
import CustomCheckbox from "../../components/Checkbox/Checkbox";
import ActionButtonsBlock from "./components/ActionButtonsBlock";
import Select from "../../components/Select/Select";
import {
  addCustomViewServer,
  editCustomViewServer,
  getCustomViewGridTemplatesServer,
  getCustomViewsListServer,
} from "../../redux/actions/customViewsActions";
import { getAllCustomViews } from "../../redux/reducers/customViewsReducer";
import { pages } from "../../lib/routeUtils";
import { format, parseISO } from "date-fns";
import { getSimulations } from "../../redux/reducers/simulationsReducer";
import { getSimulationsServer } from "../../redux/actions/simulationsActions";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
}

interface Props {
  isEditMode?: boolean;
}

const AddEditCustomView = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { customViewId, simulationId } = useParams();
  const navigate = useNavigate();
  const formPrefilledRef = useRef<boolean>(false);

  const customViews = useSelector(getAllCustomViews);
  const simulations = useSelector(getSimulations);

  const currentView = (customViews || []).find(
    (view) => view["custom-view-id"] === Number(customViewId) && view["simulation-id"] === Number(simulationId),
  );

  const simulationOwnerItems = simulations.map(
    (item) => item["simulation-name"] + " [" + item["simulation-owner-name"] + "]",
  );

  const initialState = {
    customViewName: "",
    simulationOwner: "",
    gridTemplateId: 1,
    displayAfter: "Simulation data browser",
    isActive: true,
  };
  const actionName = isEditMode ? "Edit" : "Create";

  const [customViewName, setCustomViewName] = useState<string>(initialState.customViewName);
  const [simulationOwner, setSimulationOwner] = useState<string>(initialState.simulationOwner);
  const [gridTemplateId, setGridTemplateId] = useState<number>(initialState.gridTemplateId);
  const [displayAfter, setDisplayAfter] = useState<string>(initialState.displayAfter);
  const [isActive, setIsActive] = useState<boolean>(initialState.isActive);
  const [isNameMissing, setIsNameMissing] = useState<boolean>(false);

  const selectSubItems = ["Simulation data browser"].concat(
    (customViews || [])
      .filter(
        (view) =>
          `${view["simulation-name"]} [${
            simulations?.find((sim) => sim["simulation-id"] === view["simulation-id"])?.["simulation-owner-name"]
          }]` === simulationOwner,
      )
      .map((el) => el["custom-view-caption"]),
  );

  const selectedSimulationId = simulations.find(
    (item) => item["simulation-name"] + " [" + item["simulation-owner-name"] + "]" === simulationOwner,
  )?.["simulation-id"];

  const selectedSimulation = simulations.find((item) => item["simulation-id"] === currentView?.["simulation-id"]);
  const prefilledSimulationOwner = selectedSimulation
    ? selectedSimulation["simulation-name"] + " [" + selectedSimulation["simulation-owner-name"] + "]"
    : "";

  useEffect(() => {
    dispatch(getCustomViewGridTemplatesServer());
    dispatch(getSimulationsServer({}));
    dispatch(getCustomViewsListServer());
  }, []);

  useEffect(() => {
    if (isEditMode && currentView && prefilledSimulationOwner && !formPrefilledRef.current) {
      prefillForm();
      formPrefilledRef.current = true;
    }
  }, [isEditMode, currentView, prefilledSimulationOwner]);

  const clearForm = () => {
    setCustomViewName(initialState.customViewName);
    setGridTemplateId(initialState.gridTemplateId);
    setDisplayAfter(initialState.displayAfter);
    setIsActive(initialState.isActive);
  };

  const prefillForm = () => {
    if (currentView) {
      setCustomViewName(currentView["custom-view-caption"]);
      setSimulationOwner(prefilledSimulationOwner);
      setGridTemplateId(currentView["custom-view-grid-template-id"]);
      setDisplayAfter(selectSubItems[currentView["custom-view-menu-index"]]);
      setIsActive(currentView["is-custom-view-active"]);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomViewName(value);
    setIsNameMissing(!value);
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(`${pages.customViewsList()}`);
  };

  const handleSubmit = () => {
    if (!customViewName) {
      setIsNameMissing(true);
      return;
    }

    if (isEditMode)
      dispatch(
        editCustomViewServer({
          "simulation-id": Number(selectedSimulationId),
          "custom-view-id": Number(customViewId),
          "custom-view-caption": customViewName,
          "custom-view-menu-index": selectSubItems.findIndex((el) => el === displayAfter),
          "custom-view-grid-template-id": gridTemplateId,
          "is-custom-view-active": isActive,
          redirect: () => navigate(`${pages.customViewsList()}`),
        }),
      );
    else
      dispatch(
        addCustomViewServer({
          "simulation-id": Number(selectedSimulationId),
          "custom-view-caption": customViewName,
          "custom-view-menu-index": selectSubItems.findIndex((el) => el === displayAfter),
          "custom-view-grid-template-id": gridTemplateId,
          "is-custom-view-active": isActive,
          redirect: () => navigate(`${pages.customViewsList()}`),
        }),
      );
  };

  return (
    <Wrapper>
      <Seo title={`${actionName} Custom View`} />
      <Container
        breadcrumbs={<CustomBreadcrumbs actionName={actionName} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        <MainContainer
          requireField
          title="Custom view name"
          content={
            <Input
              error={isNameMissing}
              helperText="The field is required, please fill in!"
              placeholder="Enter name"
              value={customViewName}
              handleChange={handleNameChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Simulation"
          content={<Select value={simulationOwner} onChange={setSimulationOwner} options={simulationOwnerItems} />}
        />
        <MainContainer
          requireField
          title="Custom view grid template"
          content={<GridTemplate value={gridTemplateId} onChange={setGridTemplateId} />}
        />
        <MainContainer
          requireField
          title="Display after"
          content={
            <Select
              value={displayAfter}
              onChange={setDisplayAfter}
              options={selectSubItems}
              excludeOptions={isEditMode ? [currentView?.["custom-view-caption"] || ""] : []}
            />
          }
        />
        <MainContainer title="Is active" content={<CustomCheckbox isChecked={isActive} onChange={setIsActive} />} />
        {isEditMode && (
          <>
            <MainContainer
              title="Time Stamps"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Create date:{" "}
                    {format(parseISO(currentView?.["creation-date"] || new Date().toISOString()), "yyyy-MM-dd HH:mm")}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Update date:{" "}
                    {format(
                      parseISO(currentView?.["last-update-date"] || new Date().toISOString()),
                      "yyyy-MM-dd HH:mm",
                    )}
                  </Typography>
                </Grid>
              }
            />
            <MainContainer
              title="Informations"
              content={
                <Typography variant="body2" color="main.100">
                  Internal Id: {currentView?.["custom-view-id"]}
                </Typography>
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

export default withSimulation(AddEditCustomView);
