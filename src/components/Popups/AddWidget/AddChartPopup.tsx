import { useEffect, useRef } from "react";
import { Box, Typography, styled } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import Input from "../../Inputs";
import Select from "../../Select";
import SearchIcon from "../../Icons/SearchIcon";
import withAddWidget, { FilterOption, WidgetGeneralVars, WidgetUnit } from "../../../hocs/withAddWidget";
import ReoderTable, { Header, ReorderTableRow } from "../../Tables/ReorderTable";
import { Popups } from "../../../types/popups";
import { getTheme } from "../../../lib/theme/theme";
import { ChartTypeName, DataSetColor, DisplayElementType } from "../../../types/customViews";
import { AddWidgetPopupProps } from "../../../types/addWidgetPopupProps";
import { getAddChartPopupState } from "../../../redux/reducers/popupsReducer";
import { SimulationDataBrowser } from "../../../modules/SimulationDataBrowser";
import NumericFormat from "../../NumericFormat";
import CustomCheckbox from "../../Checkbox";
import { WidgetParameter } from "../../../types/addWidget";
import { getSessionInformation, getSimulationHyrarchy } from "../../../redux/reducers/simulationReducer";
import { fetchSimulationHyrarchyServer } from "../../../redux/actions/simulationActions";
import { Model, SimulationDataHyrarchy } from "../../../types/simulations";
import MultiSelect from "../../MultiSelect";

const headers: Header[] = [
  {
    text: "Data set",
    preciseWidth: 120,
  },
  {
    text: "System / model",
    preciseWidth: 250,
  },
  {
    text: "Name",
    preciseWidth: 210,
  },
  {
    text: "Units",
    preciseWidth: 120,
  },
  {
    text: "Scale",
    preciseWidth: 90,
  },
  {
    text: "Path",
    preciseWidth: 350,
    relativeWidth: "100%",
  },
];

enum ChartSettingKey {
  chartStyle = "chart-type",
  chartAspectRatio = "chart-aspect-ratio",
  history = "chart-history-size",
  stepInterval = "chart-step-interval",
  xAxisIsManualScaling = "chart-x-axis-range-type",
  xAxisMinValue = "chart-min-x-axis-value",
  xAxisMaxValue = "chart-max-x-axis-value",
  xAxisCaption = "chart-x-axis-label",
  yAxisIsManualScaling = "chart-y-axis-range-type",
  yAxisMinValue = "chart-min-y-axis-value",
  yAxisMaxValue = "chart-max-y-axis-value",
  yAxisCaption = "chart-y-axis-label",
}

const chartSettings: Record<ChartSettingKey, WidgetParameter> = {
  [ChartSettingKey.chartStyle]: {
    title: "Chart Style",
    placeholder: "Line chart",
    options: Object.values(ChartTypeName),
    variant: "select",
  },
  [ChartSettingKey.chartAspectRatio]: {
    title: "Aspect ratio",
    placeholder: "2",
    variant: "input",
    type: "number",
  },
  [ChartSettingKey.history]: {
    title: "History",
    placeholder: "500",
    variant: "input",
    type: "number",
  },
  [ChartSettingKey.stepInterval]: {
    title: "Step Interval",
    placeholder: "1",
    variant: "input",
    type: "number",
  },
  [ChartSettingKey.xAxisIsManualScaling]: {
    categoryName: "X-Axis",
    title: "Manual scaling",
    variant: "checkbox",
  },
  [ChartSettingKey.xAxisMinValue]: {
    title: "Minimum value",
    placeholder: "-1000.0",
    variant: "input",
    type: "number",
  },
  [ChartSettingKey.xAxisMaxValue]: {
    title: "Maximum value",
    placeholder: "1000.0",
    variant: "input",
    type: "number",
  },
  [ChartSettingKey.xAxisCaption]: {
    placeholder: "Please enter X-axis caption here",
    variant: "input",
    type: "text",
  },
  [ChartSettingKey.yAxisIsManualScaling]: {
    categoryName: "Y-Axis",
    title: "Manual scaling",
    variant: "checkbox",
  },
  [ChartSettingKey.yAxisMinValue]: {
    title: "Minimum value",
    placeholder: "-1000.0",
    variant: "input",
    type: "number",
  },
  [ChartSettingKey.yAxisMaxValue]: {
    title: "Maximum value",
    placeholder: "1000.0",
    variant: "input",
    type: "number",
  },
  [ChartSettingKey.yAxisCaption]: {
    placeholder: "Please enter Y-axis caption here",
    variant: "input",
    type: "text",
  },
};

const firstSettingsRow = [ChartSettingKey.chartAspectRatio, ChartSettingKey.history, ChartSettingKey.stepInterval];

const secondSettingsRow = [
  [
    ChartSettingKey.xAxisIsManualScaling,
    ChartSettingKey.xAxisMinValue,
    ChartSettingKey.xAxisMaxValue,
    ChartSettingKey.xAxisCaption,
  ],
  [
    ChartSettingKey.yAxisIsManualScaling,
    ChartSettingKey.yAxisMinValue,
    ChartSettingKey.yAxisMaxValue,
    ChartSettingKey.yAxisCaption,
  ],
];

const AddChartPopup = ({
  isOpen,
  simulationId,
  sessionId,
  filters,
  widgetUnits,
  generalVars,
  selectedUnitId,
  systemsList,
  instanceNumberList,
  mapSystemModelsNamesList,
  addNewWidgetUnit,
  selectWidgetUnit,
  selectParameter,
  onFiltersChange,
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

  const isHyrarchyFetched = useRef<boolean>(false);

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

  useEffect(() => {
    if (!isHyrarchyFetched.current && isOpen && simulationSessionData) {
      dispatch(
        fetchSimulationHyrarchyServer({
          "simulation-session-id": simulationSessionData?.["simulation-session-id"] as number,
          "max-number-of-systems-to-fetch": 100,
          "start-system-index": 0,
          "expand-model-data-items": true,
          "search-term": "",
        }),
      );
      isHyrarchyFetched.current = true;
    }
  }, [simulationSessionData, isOpen]);

  const obtainModelsList = (hyrarchy: SimulationDataHyrarchy) =>
    (hyrarchy?.["simulation-systems"] || [])
      .filter(
        (system) =>
          system["system-instance-name"] ===
          widgetUnits.find((unit) => unit.id === selectedUnitId)?.["parameter-path"]?.split?.("/")?.[0],
      )
      .reduce((prev, curr) => [...prev, ...curr["system-models"]], [] as Model[])
      .map((model) => model["model-path"]);

  const dataSetParameters: Record<string, WidgetParameter> = {
    "parameter-data-set": {
      title: "Data set",
      placeholder: "Data set",
      options: ["X-axis", "Y-axis"],
      variant: "select",
      width: 161,
    },
    "system-model": {
      title: "System / Model",
      placeholder: "System / Model",
      options: obtainModelsList(hyrarchy as SimulationDataHyrarchy),
      variant: "select",
      width: 392,
    },
    "parameter-name": {
      title: "Name",
      placeholder: "UAV[0] Altitude",
      variant: "input",
      width: 392,
    },
    "parameter-units": {
      title: "Units",
      placeholder: "Feet",
      variant: "input",
      width: 155,
      type: "text",
    },
    "parameter-scale": {
      title: "Scale",
      placeholder: "1.0",
      variant: "input",
      width: 312,
      type: "number",
    },
    "parameter-options": {
      placeholder: "Meters to feet",
      options: ["Meters to feet", "Kilometers to feet"],
      variant: "select",
      width: 318,
    },
    "data-set-color": {
      title: "Color",
      placeholder: "blue-300",
      options: Object.values(DataSetColor),
      variant: "select",
      width: 145,
    },
    "parameter-path": {
      title: "Path",
      placeholder:
        "“UAV[0]/flight_dynamics/flight_dynamics_high_level_outputs/six_dof_sta te/motion_state/velocity[0]”",
      variant: "input",
      width: 1002,
    },
  };

  const convertUnitsToRows = (widgetUnits: WidgetUnit[]): ReorderTableRow[] =>
    widgetUnits.map((unit, index) => ({
      id: unit.id,
      cells: [
        {
          id: `${unit.id}_${index}_parameter-data-set`,
          key: "parameter-data-set",
          title: unit["parameter-path"] ? unit["parameter-data-set"] : "-",
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_system-model`,
          key: "system-model",
          title: unit["system-model"],
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_parameter-name`,
          key: "parameter-name",
          title: unit["parameter-name"],
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_parameter-units`,
          key: "parameter-units",
          title: unit["parameter-path"] ? unit["parameter-units"] : "-",
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_parameter-scale`,
          key: "parameter-scale",
          title: unit["parameter-path"] ? unit["parameter-scale"] : "-",
          placeholder: "-",
          valueType: "number",
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
      <ChartSettings generalVars={generalVars} onVarChange={onGeneralVarChange} />
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
      {selectedUnitId && widgetUnits.find((unit) => unit.id === selectedUnitId)?.["parameter-path"] && (
        <>
          <Box
            bgcolor={theme.palette.grey[600]}
            border={`1px solid ${theme.palette.grey[300]}`}
            borderRadius="10px"
            padding="16px"
            marginTop="16px"
          >
            <Box display="flex" alignItems="end" rowGap="8px" columnGap="15px" flexWrap="wrap">
              {Object.keys(dataSetParameters).map((key, index) => (
                <FilterWrapper key={index} width={dataSetParameters[key].width}>
                  <Typography variant="body2" color="textColor.white" textTransform="capitalize">
                    {dataSetParameters[key].title}
                  </Typography>
                  {dataSetParameters[key].variant === "select" ? (
                    <Select
                      options={dataSetParameters[key].options as string[]}
                      value={widgetUnits.find((unit) => unit.id === selectedUnitId)?.[key] || ""}
                      placeholder={dataSetParameters[key].placeholder}
                      onChange={(nextValue) => onWidgetUnitChange(selectedUnitId, key, nextValue)}
                    />
                  ) : (
                    <Input
                      fullWidth
                      placeholder={dataSetParameters[key].placeholder}
                      value={widgetUnits.find((unit) => unit.id === selectedUnitId)?.[key] || ""}
                      InputProps={{
                        inputComponent: dataSetParameters[key].type === "number" && (NumericFormat as any),
                      }}
                      handleChange={(e) => onWidgetUnitChange(selectedUnitId, key, e.target.value)}
                    />
                  )}
                </FilterWrapper>
              ))}
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
        padding="16px 0"
        sx={{ cursor: "pointer", width: "fit-content" }}
        onClick={() =>
          addNewWidgetUnit({
            "parameter-data-set": widgetUnits.length > 0 ? "Y-axis" : "X-axis",
            "parameter-scale": "1.0",
            "parameter-options": "Meters to feet",
            "data-set-color": "blue-300",
          })
        }
      >
        Add New Charted Parameter
      </Typography>
      {selectedUnitId && (
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
              simulationId={simulationId}
              sessionId={sessionId}
              handleNodeSelect={selectParameter}
              disableOverlay
              hideHeaderActionElements
              externalFilters={filters}
            />
          </Box>
        </>
      )}
    </>
  );
};

interface ChartSettingsProps {
  generalVars: WidgetGeneralVars;
  onVarChange: (key: string, value: string) => void;
}

const ChartSettings = ({ generalVars, onVarChange }: ChartSettingsProps) => (
  <Box display="flex" flexDirection="column" gap="16px" marginBottom="16px">
    <HeaderFiltersGeneralWrapper>
      {firstSettingsRow.map((key: string, index: number) => (
        <Box key={index} display="flex" flexDirection="column" gap="12px" width="100%">
          <Typography variant="body2" color="textColor.white">
            {chartSettings[key as ChartSettingKey].title}
          </Typography>
          {chartSettings[key as ChartSettingKey].variant === "input" && (
            <Input
              fullWidth
              placeholder={chartSettings[key as ChartSettingKey].placeholder}
              InputProps={{
                inputComponent: NumericFormat as any,
              }}
              value={+generalVars[key]}
              handleChange={(e) => onVarChange(key, e?.target.value)}
            />
          )}
          {chartSettings[key as ChartSettingKey].variant === "select" && (
            <Select
              options={chartSettings[key as ChartSettingKey].options as string[]}
              value={generalVars[key]}
              placeholder={chartSettings[key as ChartSettingKey].placeholder}
              onChange={(nextValue) => onVarChange(key, nextValue)}
            />
          )}
        </Box>
      ))}
    </HeaderFiltersGeneralWrapper>
    <AdditionalFiltersWrapper>
      {secondSettingsRow.map((fields) => (
        <Box key={fields.join("_")} display="flex" flexDirection="column" rowGap="15px">
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" flexDirection="column" alignItems="start" gap="6px">
              <Typography variant="body2" color="grey.200">
                {chartSettings[fields[0]].categoryName}
              </Typography>
              <Typography variant="body2" color="textColor.white">
                {chartSettings[fields[0]].title}
              </Typography>
              <CustomCheckbox
                isChecked={generalVars[fields[0]] === "true"}
                onChange={(nextValue) => onVarChange(fields[0], String(nextValue))}
              />
            </Box>
            <Box display="flex" alignItems="center" gap="16px">
              <Box display="flex" flexDirection="column" gap="12px">
                <Typography variant="body2" color="textColor.white">
                  {chartSettings[fields[1]].title}
                </Typography>
                <Input
                  fullWidth
                  placeholder={chartSettings[fields[1]].placeholder}
                  InputProps={{
                    inputComponent: NumericFormat as any,
                  }}
                  value={+generalVars[fields[1]]}
                  handleChange={(e) => onVarChange(fields[1], e?.target.value)}
                  disabled={generalVars[fields[0]] !== "true"}
                />
              </Box>
              <Box display="flex" flexDirection="column" gap="12px">
                <Typography variant="body2" color="textColor.white">
                  {chartSettings[fields[2]].title}
                </Typography>
                <Input
                  fullWidth
                  placeholder={chartSettings[fields[2]].placeholder}
                  InputProps={{
                    inputComponent: NumericFormat as any,
                  }}
                  value={+generalVars[fields[2]]}
                  handleChange={(e) => onVarChange(fields[2], e.target.value)}
                  disabled={generalVars[fields[0]] !== "true"}
                />
              </Box>
            </Box>
          </Box>
          <Input
            fullWidth
            placeholder={chartSettings[fields[3]].placeholder}
            value={generalVars[fields[3]]}
            handleChange={(e) => onVarChange(fields[3], e.target.value)}
          />
        </Box>
      ))}
    </AdditionalFiltersWrapper>
  </Box>
);

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
    width: "100%",
    minWidth: width ? `auto` : "inherit",
    maxWidth: width ? `${width}px` : "310px",
  },
}));

const HeaderFiltersGeneralWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "26px",
  width: "100%",

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
    width: "100%",
    maxWidth: "100%",
  },
}));

const AdditionalFiltersWrapper = styled("div")(({ theme }) => ({
  border: `0.5px solid ${theme.palette.grey[300]}`,
  padding: "16px",
  display: "flex",
  alignItems: "center",
  borderRadius: "10px",
  gap: "40px",

  "& > div:first-of-type": {
    paddingRight: "40px",
    width: "50%",
    borderRight: `0.5px solid ${theme.palette.grey[300]}`,
  },

  "& > div:last-of-type": {
    width: "calc(50% - 40px)",
  },

  ".MuiFormControl-root": {
    maxWidth: "143px",
  },

  ".MuiInputBase-input": {
    height: "44px",
    padding: "0 16px",
    fontSize: theme.typography.subtitle1.fontSize,
    color: theme.palette.main[100],
  },
}));

export default withAddWidget(AddChartPopup, {
  title: "Add / Edit Charts",
  elementType: DisplayElementType.chart,
  popup: Popups.addChart,
  stateGetterFunc: getAddChartPopupState,
});
