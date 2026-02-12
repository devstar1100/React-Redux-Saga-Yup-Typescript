import { Box, Grid, Typography, styled } from "@mui/material";
import Container from "../../components/WidgetContainer/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { pages } from "../../lib/routeUtils";
import { useNavigate, useParams } from "react-router";
import { FC, ReactElement, useEffect, useMemo, useState } from "react";
import withSimulation from "../../hocs/withSimulation";
import Select from "../../components/Select";
import { useSelector } from "react-redux";
import Input from "../../components/Inputs/Input";
import { editScenarioInitialState, editScenarioInitialErrorsState } from "./lib/formInitialState";
import { useDispatch } from "react-redux";

import Alert, { AlertVariant } from "../../components/Alert/Alert";
import { getEnumeratorsServer, getSimulationsServer } from "../../redux/actions/simulationsActions";
import { getEnumerators } from "../../redux/reducers/simulationsReducer";
import { ScenarioAction, ScenarioActionParameter, ScenarioTimeRepresentation } from "../../types/scenarioAction";
import {
  getCurrentScenarioListActions,
  getScenarioActionsValidationErrors,
} from "../../redux/reducers/scenarioActionsReducer";
import {
  addEditScenarioActionsServer,
  getScenarioListActionsServer,
  updateScenarioActionsValidationErrors,
} from "../../redux/actions/scenarioListActions";
import { manageScenarioActionDto } from "./lib/manageScenario.dto";
import ReoderTable, { Header, ReorderTableRow } from "../../components/Tables/ReorderTable/ReorderTable";
import MultiSelect from "../../components/MultiSelect/MultiSelect";
import { SimulationDataBrowser } from "../SimulationDataBrowser/SimulationDataBrowser";
import { getTheme } from "../../lib/theme/theme";
import { DataBrowserFilterKey, FilterOption, WidgetUnit, generateWidgetUnitId } from "../../hocs/withAddWidget";
import { DropResult } from "react-beautiful-dnd";
import { DataBrowserFilters } from "../../types/dataBrowserFilters";
import SearchIcon from "../../components/Icons/SearchIcon";
import { toast } from "react-toastify";
import { Model, ModelDataItem, System } from "../../types/simulations";
import { getSimulationHyrarchy } from "../../redux/reducers/simulationReducer";
import { getCurrentScenarioFiles } from "../../redux/reducers/scenarioFilesReducer";
import { getScenarioFilesServer } from "../../redux/actions/scenarioFilesActions";
import { getSimDependantPageFullLink } from "../../lib/simulationConfigurationUtils";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";

enum PageMode {
  "create" = "create",
  "edit" = "edit",
}

const headers: Header[] = [
  {
    text: "Parameter value",
    preciseWidth: 250,
  },
  {
    text: "Parameter path",
    preciseWidth: 300,
    relativeWidth: "100%",
  },
];

const initialFilters = {
  caption: "",
  search: "",
  systemType: [],
  modelType: [],
  instanceNumber: "0",
};

interface Props {
  pageMode: PageMode;
}

const AddEditScenarioFilePage: FC<Props> = ({ pageMode }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { listId, actionKey } = useParams();
  const theme = getTheme();
  const { simulationId: simIdStr, sessionId: sessionIdStr } = useParams();

  const simulationId = Number(simIdStr);
  const sessionId = Number(sessionIdStr);

  const scenarioActions = useSelector(getCurrentScenarioListActions);
  const enumerators = useSelector(getEnumerators);
  const simulationHierarchy = useSelector(getSimulationHyrarchy);
  const scenarioActionsValidationErrors = useSelector(getScenarioActionsValidationErrors);
  const scenarioFiles = useSelector(getCurrentScenarioFiles);

  const systems = (simulationHierarchy?.["simulation-systems"] || []) as System[];
  const systemsList = simulationHierarchy?.["system-types"] || [];
  const modelsList = simulationHierarchy?.["model-types"] || [];
  const instanceNumberList = Array.from(Array(Number(simulationHierarchy?.["total-number-of-systems"]) || 0).keys());

  const [formData, setFormData] = useState<ScenarioAction>(editScenarioInitialState);
  const [errors, setErrors] = useState<Record<keyof ScenarioAction, string>>(editScenarioInitialErrorsState);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [units, setUnits] = useState<WidgetUnit[]>([]);
  const [filters, setFilters] = useState<DataBrowserFilters>(initialFilters);

  const isEditMode = pageMode === "edit";
  const actionName = isEditMode ? "Edit" : "Create";

  const currentAction = useMemo(
    () => scenarioActions.find((file) => file["action-key"] === actionKey),
    [scenarioActions],
  );
  const currentFile = useMemo(
    () => scenarioFiles.find((file) => String(file["scenario-file-id"]) === listId),
    [scenarioFiles],
  );

  const scenarioActionTypeEnum = useMemo(() => {
    return enumerators?.find((enumerator) => enumerator["enum-type"] === "scenario-action-type");
  }, [enumerators]);

  const scenarioActionTypeOptions = useMemo(() => {
    const timeRepresentationTypesOptions = scenarioActionTypeEnum
      ? scenarioActionTypeEnum["enum-values"].map((value) => value["enum-value-string"])
      : [];

    return timeRepresentationTypesOptions;
  }, [scenarioActionTypeEnum]);

  const scenarioRepresentationEnum = useMemo(() => {
    return enumerators?.find((enumerator) => enumerator["enum-type"] === "scenario-time-representation");
  }, [enumerators]);

  const scenarioRepresentationTypeOptions = useMemo(() => {
    const timeRepresentationTypesOptions = scenarioRepresentationEnum
      ? scenarioRepresentationEnum["enum-values"].map((value) => value["enum-value-string"])
      : [];

    return timeRepresentationTypesOptions;
  }, [scenarioRepresentationEnum]);

  const mapSystemModelsNamesList: { [system: string]: string[] } = systemsList.reduce(
    (acc, curr) => ({
      ...acc,
      [curr["system-type-name"]]: modelsList
        .filter((model) => model["model-type-name"].split("/")[0] === curr["system-type-name"])
        .map((model) => model["model-type-name"]),
    }),
    {},
  );

  const allParameters = useMemo(
    () => [
      ...(simulationHierarchy?.["custom-simulation-data"] || []),
      ...systems
        .reduce((acc, curr) => [...acc, ...(curr["system-models"] || [])], [] as Model[])
        .reduce((acc, curr) => [...acc, ...(curr["model-data-items"] || [])], [] as ModelDataItem[]),
    ],
    [systems],
  );

  const filterOptions: Record<string, FilterOption> = {
    systemType: {
      placeholder: "System Type",
      options: [...systemsList.map((el) => el["system-type-name"])],
    },
    modelType: {
      placeholder: "Model Type",
      options: [
        ...((filters.systemType as string[]).reduce(
          (acc, curr) => [...acc, ...mapSystemModelsNamesList[curr]],
          [] as string[],
        ) || []),
      ],
    },
    instanceNumber: {
      placeholder: "All instances",
      options: [...instanceNumberList.map(String)],
    },
  };

  const convertUnitsToRows = (units: WidgetUnit[]): ReorderTableRow[] =>
    units.map((unit, index) => ({
      id: unit.id,
      cells: [
        {
          id: `${unit.id}_${index}_parameter-value`,
          key: "parameter-value",
          title: unit["parameter-value"],
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_parameter-path`,
          key: "parameter-path",
          title: unit["parameter-path"],
          placeholder: "...Select parameter",
          rightToLeft: true,
        },
      ],
    }));

  const selectUnit = (id: string) => {
    const targetUnit = units.find((unit) => unit.id === id) as WidgetUnit;

    if (targetUnit && targetUnit["parameter-path"]) return;
    if (id !== selectedUnitId) setSelectedUnitId(id);
  };

  const onUnitChange = (id: string, key: string, value: string, valueType?: "string" | "number") => {
    if (valueType !== "number" || /^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
      setUnits((prev) => prev.map((unit) => (unit.id === id ? { ...unit, [key]: value } : unit)));
    }
  };

  const onUnitsReorder = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const reorderedRows = Array.from(units);
    const [removed] = reorderedRows.splice(result.source.index, 1);
    reorderedRows.splice(result.destination.index, 0, removed);

    setUnits(reorderedRows);
  };

  const onUnitEdit = (id: string) => {
    setSelectedUnitId(id);
  };

  const onUnitDuplicate = (id: string) => {
    const duplicatedRow = {
      ...(units.find((unit) => unit.id === id) as WidgetUnit),
      id: generateWidgetUnitId(),
    };

    const nextData = [...units];
    nextData.splice(units.findIndex((unit) => unit.id === id) + 1, 0, duplicatedRow);

    setUnits(nextData);
  };

  const onUnitDelete = (id: string) => {
    setUnits((prev) => prev.filter((unit) => unit.id !== id));

    if (id === selectedUnitId) setSelectedUnitId("");
  };

  const addNewUnit = (props: Record<string, string> = {}) => {
    setUnits((prev) => [...prev, { ...props, id: generateWidgetUnitId() }]);
  };

  const onFiltersChange = (key: DataBrowserFilterKey, event: any) => {
    let newValue;
    const textFields = ["caption", "search"];

    if (textFields.includes(key)) newValue = event.target.value;
    else newValue = event;

    setFilters({ ...filters, [key]: newValue });
  };

  const selectParameter = (_event: any, nodeId: string) => {
    const targetParam = allParameters.find((param) => param["param-path"] === nodeId);
    const allChilds = allParameters.filter((param) => param["param-path"].includes(nodeId));

    if (!targetParam) return;
    if (allChilds.length > 1) return;

    if (targetParam) {
      const nextWidgetUnits: WidgetUnit[] = units.map((unit) =>
        unit.id === selectedUnitId
          ? ({
              ...unit,
              "parameter-value": targetParam["param-data-value"],
              "parameter-path": targetParam["param-path"],
            } as WidgetUnit)
          : unit,
      );
      setUnits(nextWidgetUnits);
      setSelectedUnitId("");

      toast.info("Selected the paramater");
    }
  };

  const handleSubmit = () => {
    if (!listId) return;
    const redirect = () =>
      navigate(
        `${getSimDependantPageFullLink({ baseRoute: pages.scenarioActions(), simulationId, sessionId })}/${listId}`,
      );

    const actionTypeEnumId = scenarioActionTypeEnum?.["enum-values"].find(
      (value) => value["enum-value-string"] === formData["action-type"],
    )?.["enum-value-id"];

    const scenarioRepresentationEnumId = scenarioRepresentationEnum?.["enum-values"].find(
      (value) => value["enum-value-string"] === formData["scenario-time-representation"],
    )?.["enum-value-id"];

    if (isEditMode && actionKey) {
      dispatch(
        addEditScenarioActionsServer({
          actionType: "edit",
          actionKey: actionKey,
          scenarioFileId: +listId,
          scenarioFile: manageScenarioActionDto({
            file: formData,
            actionTypeEnumId,
            scenarioRepresentationEnumId,
            parameters: units as unknown as ScenarioActionParameter[],
          }),
          redirect,
        }),
      );
    } else if (!isEditMode) {
      dispatch(
        addEditScenarioActionsServer({
          actionType: "add",
          scenarioFileId: +listId,
          actionKey: formData["action-key"],
          scenarioFile: manageScenarioActionDto({
            file: formData,
            actionTypeEnumId,
            scenarioRepresentationEnumId,
            parameters: units as unknown as ScenarioActionParameter[],
          }),
          redirect,
        }),
      );
    }
  };

  const handleSelectChange = (key: keyof ScenarioAction) => (newValue: string) => {
    setFormData({ ...formData, [key]: newValue });
  };

  const clearForm = () => {
    setFormData(editScenarioInitialState);
    setErrors(editScenarioInitialErrorsState);
  };

  const prefillForm = () => {
    if (currentAction && enumerators?.length) {
      // const simulationOwnerName = `${currentFile["simulation-name"]} [${currentFile["simulation-owner-name"]}]`;
      const timeRepTypes = enumerators.find(
        (enumerator) => enumerator["enum-type"] === "scenario-time-representation",
      )?.["enum-values"];
      const timeRepValue = timeRepTypes?.find(
        (type) => type["enum-value-id"] === currentAction["time-representation-enum"],
      )?.["enum-value-string"] as ScenarioTimeRepresentation;
      const units = currentAction["parameters-list"].map((param) => ({
        ...param,
        "parameter-value": String(param["parameter-value"]),
        id: generateWidgetUnitId(),
      }));

      setFormData({
        ...currentAction,
        "scenario-time-representation": timeRepValue || "Ticks",
        "tick-number": String(currentAction["action-time"]),
        "elapsed-time": String(currentAction["action-time"]),
      });
      setUnits(units);
      setErrors(editScenarioInitialErrorsState);
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(
      `${getSimDependantPageFullLink({ baseRoute: pages.scenarioActions(), simulationId, sessionId })}/${listId}`,
    );
  };

  const handleInputChange =
    (field: keyof ScenarioAction, size?: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (listId) {
      dispatch(getScenarioFilesServer());
      dispatch(getScenarioListActionsServer(parseInt(listId)));
    }
    dispatch(getSimulationsServer({}));
    dispatch(getEnumeratorsServer());
  }, []);

  useEffect(() => {
    prefillForm();
  }, [currentAction, enumerators]);

  useEffect(() => {
    dispatch(updateScenarioActionsValidationErrors([]));
  }, []);

  const scenarioActionUrl = `${getSimDependantPageFullLink({
    baseRoute: pages.scenarioActions(),
    simulationId,
    sessionId,
  })}/${listId}`;

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Scenario actions", to: scenarioActionUrl },
    { label: `${actionName} scenario action`, to: "" },
  ];

  return (
    <Wrapper>
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!scenarioActionsValidationErrors?.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {scenarioActionsValidationErrors.map((error, index) => (
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
          key="action-key"
          requireField={true}
          title="Action key"
          content={
            <Input
              error={
                !!errors["action-key"] ||
                !!scenarioActionsValidationErrors.find((error) => error["form-field-name"] === "action-key")
              }
              helperText={errors["action-key"] ? errors["action-key"] : ""}
              placeholder={"Action key"}
              value={formData["action-key"]}
              handleChange={handleInputChange("action-key", 127)}
            />
          }
        />
        <MainContainer
          requireField
          title="Action type"
          content={
            <Select
              value={formData["action-type"]}
              onChange={handleSelectChange("action-type")}
              options={scenarioActionTypeOptions}
            />
          }
        />
        <MainContainer
          requireField
          title="Scenario time representation"
          content={
            <Select
              // value={formData["scenario-time-representation"]}
              value={currentFile?.["time-representation"] || ""}
              onChange={handleSelectChange("scenario-time-representation")}
              options={scenarioRepresentationTypeOptions}
              excludeOptions={isEditMode ? [currentAction?.["scenario-time-representation"] || ""] : []}
              disabled
            />
          }
        />
        {currentFile?.["time-representation"] === "Ticks" && (
          <MainContainer
            key="tick-number"
            requireField={true}
            title="Tick number"
            content={
              <Input
                error={
                  !!errors["tick-number"] ||
                  !!scenarioActionsValidationErrors.find((error) => error["form-field-name"] === "tick-number")
                }
                type="number"
                helperText={errors["tick-number"] ? errors["tick-number"] : ""}
                placeholder={"Tick number"}
                value={formData["tick-number"] as string}
                handleChange={handleInputChange("tick-number", 10)}
              />
            }
          />
        )}
        {currentFile?.["time-representation"] === "Elapsed Seconds" && (
          <MainContainer
            key="elapsed-time"
            requireField={true}
            title="Elapsed seconds"
            content={
              <Input
                error={
                  !!errors["elapsed-time"] ||
                  !!scenarioActionsValidationErrors.find((error) => error["form-field-name"] === "elapsed-time")
                }
                type="number"
                helperText={errors["elapsed-time"] ? errors["elapsed-time"] : ""}
                placeholder={"Elapsed seconds"}
                value={formData["elapsed-time"] || ""}
                handleChange={handleInputChange("elapsed-time", 10)}
              />
            }
          />
        )}
        <MainContainer
          key="action-enum"
          requireField={true}
          title="Action enum"
          content={
            <Input
              error={
                !!errors["action-enum"] ||
                !!scenarioActionsValidationErrors.find((error) => error["form-field-name"] === "action-enum")
              }
              helperText={errors["action-enum"] ? errors["action-enum"] : ""}
              placeholder={"Event enum"}
              value={formData["action-enum"]}
              handleChange={handleInputChange("action-enum", 255)}
            />
          }
        />
        <MainContainer
          key="console-message"
          title="Console message"
          content={
            <Input
              error={
                !!errors["console-message"] ||
                !!scenarioActionsValidationErrors.find((error) => error["form-field-name"] === "console-message")
              }
              helperText={errors["console-message"] ? errors["console-message"] : ""}
              placeholder={"Console message"}
              value={formData["console-message"]}
              handleChange={handleInputChange("console-message", 255)}
            />
          }
        />
        <MainContainer
          key="modified-parameters"
          title="Modified parameters"
          content={
            <Typography variant="body2" color="grey.50" fontStyle="italic">
              Please see the table below:
            </Typography>
          }
        />
        <ReoderTable
          headers={headers}
          data={convertUnitsToRows(units)}
          onRowSelect={selectUnit}
          onCellChange={onUnitChange}
          onReorder={onUnitsReorder}
          onEdit={onUnitEdit}
          onDuplicate={onUnitDuplicate}
          onDelete={onUnitDelete}
        />
        <Typography
          variant="body1"
          fontWeight={700}
          color="blue.300"
          padding="16px 0"
          sx={{ cursor: "pointer", width: "fit-content" }}
          onClick={() => addNewUnit({ "parameter-scale": "1.0" })}
        >
          Add New Parameter
        </Typography>
        {selectedUnitId && !Number.isNaN(Number(sessionId)) && (
          <>
            <Box
              bgcolor={theme.palette.grey[600]}
              border={`1px solid ${theme.palette.grey[300]}`}
              borderRadius="10px"
              padding="16px"
            >
              <Box display="flex" flexDirection="column" gap="16px" marginBottom="16px">
                <Typography variant="custom1" color="textColor.white" fontFamily="fontFamily">
                  Data Dictionary Filters
                </Typography>
                <InputWrapper>
                  <Input
                    fullWidth
                    placeholder="Search here"
                    value={filters?.search as string}
                    handleChange={(e) => onFiltersChange("search", e)}
                  />
                  <SearchIcon />
                </InputWrapper>
              </Box>
              <Box display="flex" alignItems="center" gap="26px">
                {Object.keys(filterOptions)
                  .filter((_el, idx) => idx < 2)
                  .map((key, index) => (
                    <FilterWrapper key={index}>
                      <Typography
                        variant="body2"
                        color="textColor.white"
                        textTransform="capitalize"
                        sx={{ "& > b": { color: "red.400" } }}
                      >
                        {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
                        <b>*</b>
                      </Typography>
                      <MultiSelect
                        options={filterOptions[key].options}
                        value={filters[key as keyof typeof filters] as string[]}
                        placeholder={filterOptions[key].placeholder}
                        onChange={(e) => onFiltersChange(key, e)}
                        disabled={key === "modelType" && !filters.systemType}
                      />
                    </FilterWrapper>
                  ))}
                <FilterWrapper>
                  <Typography variant="body2" color="textColor.white" sx={{ "& > b": { color: "red.400" } }}>
                    System instance number<b>*</b>
                  </Typography>
                  <Select
                    options={filterOptions.instanceNumber.options}
                    value={filters.instanceNumber as string}
                    placeholder={filterOptions.instanceNumber.placeholder}
                    onChange={(e) => onFiltersChange("instanceNumber", e)}
                  />
                </FilterWrapper>
              </Box>
            </Box>
            <Box marginTop="16px">
              <SimulationDataBrowser
                simulationId={Number(simulationId)}
                sessionId={Number(sessionId)}
                handleNodeSelect={selectParameter}
                disableOverlay
                hideHeaderActionElements
                externalFilters={filters}
              />
            </Box>
          </>
        )}
        {Number.isNaN(Number(sessionId)) && (
          <Alert
            title="Simulation session is not running, data browser is unavailable. Launch a simulation if you want to use data browser"
            variant={AlertVariant.warning}
          />
        )}
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

const InputWrapper = styled("div")(({ theme }) => ({
  width: "100%",
  position: "relative",

  svg: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translate(0, -50%)",
  },

  ".MuiInputBase-input": {
    padding: "0 30px !important",
    height: "44px",
    fontSize: theme.typography.subtitle1.fontSize,
    color: theme.palette.main[100],

    "&::placeholder": {
      fontSize: theme.typography.subtitle1.fontSize,
      color: theme.palette.main[200],
    },
  },
}));

const FilterWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "100%",

  ".MuiFormControl-root": {
    maxWidth: "310px",
    width: "100%",
  },

  ".customSelect .MuiInputBase-root": {
    width: "100% !important",
  },
});

export default withSimulation(AddEditScenarioFilePage);
