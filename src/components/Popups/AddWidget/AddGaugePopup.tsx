import { Box, Typography, styled } from "@mui/material";

import Input from "../../Inputs/Input";
import Select from "../../Select";
import SearchIcon from "../../Icons/SearchIcon";
import withAddWidget, { WidgetUnit } from "../../../hocs/withAddWidget";
import { SimulationDataBrowser } from "../../../modules/SimulationDataBrowser/SimulationDataBrowser";
import ReoderTable, { Header, ReorderTableRow } from "../../Tables/ReorderTable/ReorderTable";
import { Popups } from "../../../types/popups";
import { getTheme } from "../../../lib/theme/theme";
import { DisplayElementType } from "../../../types/customViews";
import { AddWidgetPopupProps } from "../../../types/addWidgetPopupProps";
import { getAddGaugePopupState } from "../../../redux/reducers/popupsReducer";
import MultiSelect from "../../MultiSelect/MultiSelect";

interface FilterOption {
  placeholder: string;
  options: string[];
}

const headers: Header[] = [
  {
    text: "System / model",
    preciseWidth: 230,
  },
  {
    text: "Name",
    preciseWidth: 180,
  },
  {
    text: "Units",
    preciseWidth: 150,
  },
  {
    text: "Maximum value",
    preciseWidth: 140,
  },
  {
    text: "Scale",
    preciseWidth: 130,
  },
  {
    text: "Path",
    preciseWidth: 332,
    relativeWidth: "100%",
  },
];

const AddGaugePopup = ({
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
          id: `${unit.id}_${index}_parameter-name`,
          key: "parameter-name",
          title: unit["parameter-name"],
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_parameter-units`,
          key: "parameter-units",
          title: unit["parameter-path"] ? unit["parameter-units"] || "-" : "",
          placeholder: "-",
        },
        {
          id: `${unit.id}_${index}_gauge-maximum-value`,
          key: "gauge-maximum-value",
          title: unit["parameter-path"] ? unit["gauge-maximum-value"] : "-",
          placeholder: "-",
          valueType: "number",
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
        sx={{ cursor: "pointer" }}
        onClick={() => addNewWidgetUnit({ "parameter-scale": "1.0", "gauge-maximum-value": "150.0" })}
      >
        Add New Parameter
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

export default withAddWidget(AddGaugePopup, {
  title: "Add / Edit Gauge",
  elementType: DisplayElementType.gauges,
  popup: Popups.addGauge,
  stateGetterFunc: getAddGaugePopupState,
});
