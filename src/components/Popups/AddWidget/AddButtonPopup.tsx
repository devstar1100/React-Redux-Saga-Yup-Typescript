import { ReactNode, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, Typography, styled } from "@mui/material";

import Input from "../../Inputs/Input";
import withAddWidget, { WidgetUnit } from "../../../hocs/withAddWidget";
import ReoderTable, { Header, ReorderTableRow } from "../../Tables/ReorderTable/ReorderTable";
import { Popups } from "../../../types/popups";
import { DisplayElementButtonType, DisplayElementType, MapIconType } from "../../../types/customViews";
import { AddWidgetPopupProps } from "../../../types/addWidgetPopupProps";
import { getAddButtonPopupState } from "../../../redux/reducers/popupsReducer";
import { getTheme } from "../../../lib/theme/theme";
import Select from "../../Select/Select";
import NumericFormat from "../../NumericFormat/NumericFormat";
import { getIconByType } from "../../../lib/getIconByType";
import { ButtonUnit } from "../../../types/addWidget";
import {
  getCurrentSimulation,
  getSessionInformation,
  getSimulationHyrarchy,
} from "../../../redux/reducers/simulationReducer";
import { fetchSimulationHyrarchyServer } from "../../../redux/actions/simulationActions";
import { getMapSystemModelsList } from "../../../lib/getMapSystemModelsList";
import { formEventTargetModel } from "../../../lib/formEventTargetModel";
import { getCurrentScenarioFiles } from "../../../redux/reducers/scenarioFilesReducer";
import { getScenarioFilesServer } from "../../../redux/actions/scenarioFilesActions";
import { getScenarioListActionsServer } from "../../../redux/actions/scenarioListActions";
import { getCurrentScenarioListActions } from "../../../redux/reducers/scenarioActionsReducer";

interface ButtonParameters {
  title?: string;
  placeholder: string;
  options?: string[];
  variant: "select" | "input";
  type?: "text" | "number";
  width: number;
  required?: boolean;
}

const headers: Header[] = [
  {
    text: "Button caption",
    preciseWidth: 350,
  },
  // {
  //   text: "Button Type",
  //   width: 108,
  // },
  {
    text: "Action Key",
    preciseWidth: 300,
    relativeWidth: "100%",
  },
  {
    text: "Button icon",
    preciseWidth: 200,
  },
];

const AddButtonPopup = ({
  isOpen,
  widgetUnits,
  generalVars,
  selectedUnitId,
  addNewWidgetUnit,
  selectWidgetUnit,
  onGeneralVarChange,
  onWidgetUnitChange,
  onWidgetUnitsReorder,
  onWidgetUnitEdit,
  onWidgetUnitDuplicate,
  onWidgetUnitDelete,
}: AddWidgetPopupProps) => {
  const theme = getTheme();
  const dispatch = useDispatch();

  const hyrarchy = useSelector(getSimulationHyrarchy);
  const simulationSessionData = useSelector(getSessionInformation);
  const scenarioFiles = useSelector(getCurrentScenarioFiles);
  const scenarioActions = useSelector(getCurrentScenarioListActions);
  const simulation = useSelector(getCurrentSimulation);

  const systemsList = hyrarchy?.["system-types"] || [];
  const modelsList = hyrarchy?.["model-types"] || [];

  const selectedSystemType = widgetUnits.find((unit) => unit.id === selectedUnitId)?.["system-type-name"] || "";
  const selectedSystemQuantity =
    systemsList.find((system) => system["system-type-name"] === selectedSystemType)?.["system-quantity"] || 0;
  const sysInstanceNumOptions = Array.from(new Array(selectedSystemQuantity).keys()).map(String);

  const mapSystemModelsNamesList = getMapSystemModelsList({ systemsList, modelsList });

  const selectedModelType = widgetUnits.find((unit) => unit.id === selectedUnitId)?.["model-type-name"] || "";
  const selectedModelQuantity =
    modelsList.find((model) => model["model-type-name"] === selectedModelType)?.["model-quantity"] || 0;
  const mlInstanceNumOptions = Array.from(new Array(selectedModelQuantity).keys()).map(String);

  const selectedScenarioFile = useMemo(
    () => widgetUnits.find((unit) => unit.id === selectedUnitId)?.["scenario-file-name"] as string,
    [widgetUnits, selectedUnitId],
  );
  const selectedScenarioId = useMemo(
    () => scenarioFiles.find((file) => file["scenario-file-name"] === selectedScenarioFile)?.["scenario-file-id"],
    [scenarioFiles, selectedScenarioFile],
  );

  useEffect(() => {
    if (selectedScenarioId) dispatch(getScenarioListActionsServer(selectedScenarioId));
  }, [selectedScenarioId]);

  const scenarioFileOptions = useMemo(
    () =>
      scenarioFiles
        .filter(
          (el) =>
            `${el["simulation-name"]} [${el["simulation-owner-name"]}]` ===
            `${simulation?.["simulation-name"]} [${simulation?.["simulation-owner-name"]}]`,
        )
        .map((el) => el["scenario-file-name"]),
    [scenarioFiles, simulation],
  );
  const scenarioActionKeyOptions = useMemo(
    () => scenarioActions.map((action) => action["action-key"]),
    [scenarioActions],
  );

  const isHyrarchyFetched = useRef<boolean>(false);

  useEffect(() => {
    if (!isHyrarchyFetched.current && isOpen && simulationSessionData) {
      dispatch(
        fetchSimulationHyrarchyServer({
          "simulation-session-id": simulationSessionData?.["simulation-session-id"] as number,
          "max-number-of-systems-to-fetch": 100,
          "start-system-index": 0,
          "expand-model-data-items": false,
          "search-term": "",
        }),
      );
      isHyrarchyFetched.current = true;
    }
  }, [simulationSessionData, isOpen]);

  const buttonSettings: Record<keyof ButtonUnit, ButtonParameters> = {
    "button-caption": {
      title: "Button Caption",
      placeholder: "Send Take of Command",
      variant: "input",
      width: 400,
    },
    "button-icon": {
      title: "Icon Type",
      placeholder: "Icon Type",
      options: [
        "Not defined",
        MapIconType.aircraft,
        MapIconType.box,
        MapIconType.car,
        MapIconType.circle,
        MapIconType.satellite,
      ],
      variant: "select",
      width: 120,
    },
    // "button-type": {
    //   title: "Button Type",
    //   placeholder: "Button Type",
    //   options: [DisplayElementButtonType.pushButton, DisplayElementButtonType.switchButton],
    //   variant: "select",
    //   width: 242,
    // },
    "scenario-file-name": {
      title: "Scenario name",
      placeholder: "Scenario name",
      options: scenarioFileOptions,
      variant: "select",
      width: 300,
    },
    "action-key": {
      title: "Action Key",
      placeholder: "Action key",
      options: scenarioActionKeyOptions,
      variant: "select",
      width: 400,
    },
  };

  const addNewButton = () =>
    addNewWidgetUnit({
      "button-caption": `Button ${widgetUnits.length + 1}`,
      "button-type": DisplayElementButtonType.pushButton,
      "button-icon": "Not defined",
    });

  const convertUnitsToRows = (widgetUnits: WidgetUnit[]): ReorderTableRow[] =>
    widgetUnits.map((unit, index) => ({
      id: unit.id,
      cells: [
        {
          id: `${unit.id}_${index}_button-caption`,
          key: "button-caption",
          title: unit["button-caption"],
          placeholder: "Add caption...",
          additionalStyles: { textDecoration: "underline", cursor: "pointer" },
        },
        // {
        //   id: `${unit.id}_${index}_button-type`,
        //   key: "button-type",
        //   title: {
        //     [DisplayElementButtonType.pushButton]: "Push button",
        //     [DisplayElementButtonType.switchButton]: "Switch button",
        //   }[unit["button-type"]],
        //   placeholder: "Set type...",
        // },
        {
          id: `${unit.id}_${index}_action-key`,
          key: "action-key",
          title: unit["action-key"],
          placeholder: "",
        },
        {
          id: `${unit.id}_${index}_button-icon`,
          key: "button-icon",
          title: (
            <IconWrapper>
              <img src={getIconByType(unit["button-icon"] as MapIconType)} />
            </IconWrapper>
          ),
          placeholder: "",
        },
      ],
    }));

  const renderField = (key: string, index: number): ReactNode => (
    <FilterWrapper key={index} width={buttonSettings[key as keyof ButtonUnit].width}>
      <Typography
        variant="body2"
        color="textColor.white"
        textTransform="capitalize"
        sx={{ "& > b": { color: "red.400" } }}
      >
        {buttonSettings[key as keyof ButtonUnit].title}
        {buttonSettings[key as keyof ButtonUnit].required && <b>*</b>}
      </Typography>
      {buttonSettings[key as keyof ButtonUnit].variant === "select" ? (
        <Select
          options={buttonSettings[key as keyof ButtonUnit].options as string[]}
          value={widgetUnits.find((unit) => unit.id === selectedUnitId)?.[key as keyof ButtonUnit] as string}
          placeholder={buttonSettings[key as keyof ButtonUnit].placeholder}
          onChange={(nextValue) => onWidgetUnitChange(selectedUnitId, key, nextValue)}
        />
      ) : (
        <Input
          fullWidth
          placeholder={buttonSettings[key as keyof ButtonUnit].placeholder}
          value={widgetUnits.find((unit) => unit.id === selectedUnitId)?.[key as keyof ButtonUnit] as string}
          InputProps={{
            inputComponent: buttonSettings[key as keyof ButtonUnit].type === "number" && (NumericFormat as any),
          }}
          handleChange={(e) => onWidgetUnitChange(selectedUnitId, key, e.target.value)}
        />
      )}
    </FilterWrapper>
  );

  return (
    <>
      <Box display="flex" flexDirection="column" gap="12px" marginBottom="16px">
        <Typography variant="body2" color="textColor.white">
          Display element caption
        </Typography>
        <Input
          fullWidth
          placeholder="Please enter caption here"
          value={generalVars["display-element-caption"] || ""}
          handleChange={(e) => onGeneralVarChange("display-element-caption", e.target.value)}
        />
      </Box>
      <ReoderTable
        headers={headers}
        data={convertUnitsToRows(widgetUnits)}
        onRowSelect={selectWidgetUnit}
        onCellChange={onWidgetUnitChange}
        onReorder={onWidgetUnitsReorder}
        onEdit={onWidgetUnitEdit}
        onDuplicate={onWidgetUnitDuplicate}
        onDelete={onWidgetUnitDelete}
      />
      {selectedUnitId && (
        <>
          <Box
            bgcolor={theme.palette.grey[600]}
            border={`1px solid ${theme.palette.grey[300]}`}
            borderRadius="10px"
            padding="16px"
            marginTop="16px"
          >
            <Box display="flex" alignItems="end" rowGap="8px" columnGap="15px" flexWrap="wrap">
              {Object.keys(buttonSettings).slice(0, 5).map(renderField)}
            </Box>
            <Box display="flex" marginTop="12px" alignItems="end" rowGap="8px" columnGap="15px" flexWrap="wrap">
              {Object.keys(buttonSettings).slice(5).map(renderField)}
            </Box>
          </Box>
          <Typography
            variant="body1"
            fontWeight={700}
            color="blue.300"
            paddingTop="16px"
            sx={{ cursor: "pointer" }}
            onClick={() => selectWidgetUnit("")}
          >
            Save
          </Typography>
        </>
      )}
      <Typography
        variant="body1"
        fontWeight={700}
        color="blue.300"
        paddingTop="16px"
        sx={{ cursor: "pointer" }}
        onClick={addNewButton}
      >
        Add new button
      </Typography>
    </>
  );
};

const IconWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  "& > img": {
    width: "20px",
    display: "block",
  },
});

const FilterWrapper = styled(Box)<{ width?: number }>(({ width, theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: width ? `${width}px` : "100%",

  ".MuiFormControl-root": {
    maxWidth: width ? `${width}px` : "310px",
    width: "100%",
  },

  ".MuiInputBase-input": {
    padding: "0 16px !important",
    height: "44px",
    fontSize: theme.typography.subtitle1.fontSize,
    color: theme.palette.main[100],

    "&::placeholder": {
      fontSize: theme.typography.subtitle1.fontSize,
      color: theme.palette.main[200],
    },
  },

  ".customSelect": {
    borderRadius: "8px",
    overflow: "hidden",
    // width: "100%",
    minWidth: width ? `auto` : "inherit",
    maxWidth: width ? `${width}px` : "310px",
  },
}));

export default withAddWidget(AddButtonPopup, {
  title: "Add / Edit Button",
  elementType: DisplayElementType.buttons,
  popup: Popups.addButton,
  stateGetterFunc: getAddButtonPopupState,
});
