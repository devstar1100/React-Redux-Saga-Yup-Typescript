import { Box, Typography, styled } from "@mui/material";

import Input from "../../Inputs";
import Select from "../../Select";
import SearchIcon from "../../Icons/SearchIcon";
import CustomCheckbox from "../../Checkbox";
import NumericFormat from "../../NumericFormat";
import ReoderTable, { Header, ReorderTableRow } from "../../Tables/ReorderTable";
import withAddWidget, { FilterOption, WidgetGeneralVars, WidgetUnit } from "../../../hocs/withAddWidget";
import { Popups } from "../../../types/popups";
import { getTheme } from "../../../lib/theme/theme";
import { DisplayElementType, MapIconType } from "../../../types/customViews";
import { AddWidgetPopupProps } from "../../../types/addWidgetPopupProps";
import { getAddMapPopupState } from "../../../redux/reducers/popupsReducer";
import { SimulationDataBrowser } from "../../../modules/SimulationDataBrowser";
import { WidgetParameter } from "../../../types/addWidget";
import MultiSelect from "../../MultiSelect";

const headers: Header[] = [
  {
    text: "System / model",
    preciseWidth: 180,
  },
  {
    text: "Name",
    preciseWidth: 150,
  },
  {
    text: "Units",
    preciseWidth: 90,
  },
  {
    text: "Latitude path",
    preciseWidth: 280,
    relativeWidth: "50%",
  },
  {
    text: "Longitude path",
    preciseWidth: 280,
    relativeWidth: "50%",
  },
];

enum MapSettingKey {
  initialZoomLevel = "initial-zoom-level",
  mapSource = "chart-source",
  isAutoMapCenter = "is-auto-map-center",
  centralLatitude = "central-latitude",
  centralLongitude = "central-longitude",
  iconType = "icon-type",
}

const mapSettings: Record<MapSettingKey, WidgetParameter> = {
  [MapSettingKey.mapSource]: {
    title: "Map source",
    placeholder: "Google maps",
    options: ["Google maps"],
    variant: "select",
  },
  [MapSettingKey.initialZoomLevel]: {
    title: "Initial Zoom Level",
    placeholder: "1",
    variant: "input",
    type: "number",
  },
  [MapSettingKey.isAutoMapCenter]: {
    title: "Auto map center",
    variant: "checkbox",
  },
  [MapSettingKey.centralLatitude]: {
    title: "Central Latitude [deg]",
    placeholder: "-1000.0",
    variant: "input",
    type: "number",
  },
  [MapSettingKey.centralLongitude]: {
    title: "Central Longitude [deg]",
    placeholder: "1000.0",
    variant: "input",
    type: "number",
  },
  [MapSettingKey.iconType]: {
    title: "Icon Type",
    placeholder: MapIconType.aircraft,
    options: [MapIconType.aircraft, MapIconType.box, MapIconType.car, MapIconType.circle, MapIconType.satellite],
    variant: "select",
  },
};

const AddMapPopup = ({
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

  const convertUnitsToRows = (widgetUnits: WidgetUnit[]): ReorderTableRow[] =>
    widgetUnits.map((unit, index) => ({
      id: unit.id,
      cells: [
        {
          id: `${unit.id}_${index}_system-model`,
          key: "system-model",
          title: unit["system-model"],
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_name`,
          key: "name",
          title: unit["name"],
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_units`,
          key: "units",
          title: unit["units"] || "-",
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_latitude-parameter-path`,
          key: "latitude-parameter-path",
          title: unit["latitude-parameter-path"],
          placeholder: "...Select Latitude parameter",
          rightToLeft: true,
        },
        {
          id: `${unit.id}_${index}_longitude-parameter-path`,
          key: "longitude-parameter-path",
          title: unit["longitude-parameter-path"],
          placeholder: "...Select Longitude parameter",
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
      <HeaderFilters generalVars={generalVars} onVarChange={onGeneralVarChange} />
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
      <Typography
        variant="body1"
        fontWeight={700}
        color="blue.300"
        padding="16px 0"
        sx={{ cursor: "pointer", width: "fit-content" }}
        onClick={() => addNewWidgetUnit()}
      >
        Add New Entity to Map
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
              handleNodeSelect={(e, nodeId) => selectParameter(e, nodeId, true)}
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

interface MapSettingsProps {
  generalVars: WidgetGeneralVars;
  onVarChange: (key: string, value: string) => void;
}

const HeaderFilters = ({ generalVars, onVarChange }: MapSettingsProps) => (
  <Box display="flex" flexDirection="column" gap="18px" marginBottom="16px">
    <HeaderFiltersGeneralWrapper>
      <Box display="flex" flexDirection="column" gap="12px" width="100%">
        <Typography variant="body2" color="textColor.white">
          {mapSettings[MapSettingKey.mapSource].title}
        </Typography>
        <Select
          options={mapSettings[MapSettingKey.mapSource].options as string[]}
          value={generalVars[MapSettingKey.mapSource]}
          placeholder={mapSettings[MapSettingKey.mapSource].placeholder}
          onChange={(nextValue) => onVarChange(MapSettingKey.mapSource, nextValue)}
        />
      </Box>
      <Box display="flex" flexDirection="column" gap="12px" width="100%">
        <Typography variant="body2" color="textColor.white">
          {mapSettings[MapSettingKey.initialZoomLevel].title}
        </Typography>
        <Input
          fullWidth
          placeholder={mapSettings[MapSettingKey.initialZoomLevel].placeholder}
          value={generalVars[MapSettingKey.initialZoomLevel]}
          handleChange={(e) => onVarChange(MapSettingKey.initialZoomLevel, e.target.value)}
        />
      </Box>
    </HeaderFiltersGeneralWrapper>
    <AdditionalFiltersWrapper>
      <Box display="flex" alignItems="center" gap="8px">
        <Typography variant="body2" color="textColor.white">
          {mapSettings[MapSettingKey.isAutoMapCenter].title}
        </Typography>
        <CustomCheckbox
          isChecked={generalVars[MapSettingKey.isAutoMapCenter] === "true"}
          onChange={(nextValue) => onVarChange(MapSettingKey.isAutoMapCenter, String(nextValue))}
        />
      </Box>
      <Box display="flex" alignItems="center" gap="8px">
        <Typography variant="body2" color="textColor.white">
          {mapSettings[MapSettingKey.centralLatitude].title}
        </Typography>
        <Input
          fullWidth
          placeholder="-1000.0"
          InputProps={{
            inputComponent: NumericFormat as any,
          }}
          value={generalVars[MapSettingKey.centralLatitude]}
          handleChange={(e) => onVarChange(MapSettingKey.centralLatitude, e.target.value)}
        />
      </Box>
      <Box display="flex" alignItems="center" gap="8px">
        <Typography variant="body2" color="textColor.white">
          {mapSettings[MapSettingKey.centralLongitude].title}
        </Typography>
        <Input
          fullWidth
          placeholder="1000.0"
          InputProps={{
            inputComponent: NumericFormat as any,
          }}
          value={generalVars[MapSettingKey.centralLongitude]}
          handleChange={(e) => onVarChange(MapSettingKey.centralLongitude, e.target.value)}
        />
      </Box>
      <Box display="flex" alignItems="center" gap="8px">
        <Typography variant="body2" color="textColor.white">
          {mapSettings[MapSettingKey.iconType].title}
        </Typography>
        <Select
          options={mapSettings[MapSettingKey.iconType].options as string[]}
          value={generalVars[MapSettingKey.iconType] as string}
          placeholder={generalVars[MapSettingKey.iconType] || mapSettings[MapSettingKey.iconType].placeholder}
          onChange={(nextValue) => onVarChange(MapSettingKey.iconType, nextValue)}
        />
      </Box>
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

const FilterWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  width: "100%",

  ".MuiFormControl-root": {
    maxWidth: "310px",
    width: "100%",
  },
});

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
  display: "flex",
  alignItems: "center",
  gap: "28px",

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

export default withAddWidget(AddMapPopup, {
  title: "Add / Edit Map",
  elementType: DisplayElementType.map,
  popup: Popups.addMap,
  stateGetterFunc: getAddMapPopupState,
});
