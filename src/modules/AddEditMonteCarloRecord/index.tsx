import { Box, Grid, Typography, styled } from "@mui/material";
import { pages } from "../../lib/routeUtils";
import { useNavigate, useParams } from "react-router";
import { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSimulationsExtendedInfoServer, getSpecificEnumeratorServer } from "../../redux/actions/simulationsActions";
import { getEnumerators, getSimulations } from "../../redux/reducers/simulationsReducer";
import { WidgetUnit, generateWidgetUnitId } from "../../hocs/withAddWidget";
import { DropResult } from "react-beautiful-dnd";
import { DataBrowserFilters } from "../../types/dataBrowserFilters";
import { toast } from "react-toastify";
import { Model, ModelDataItem, SimulationSessionActionType, System } from "../../types/simulations";
import { getSessionInformation, getSimulationHyrarchy } from "../../redux/reducers/simulationReducer";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";
import {
  getMonteCarloRecordsServer,
  manageMonteCarloRecordServer,
  updateMonteCarloRecordValidationErrors,
} from "../../redux/actions/monteCarloRecordsActions";
import {
  getCurrentMonteCarloRecords,
  getMonteCarloRecordValidationErrors,
} from "../../redux/reducers/monteCarloRecordsReducer";
import Alert, { AlertVariant } from "../../components/Alert";
import ReoderTable, { Header, ReorderTableRow } from "../../components/Tables/ReorderTable";
import Input from "../../components/Inputs";
import BatchRecordDataBrowser from "./lib/BatchRecordDataBrowser";
import withSimulation from "../../hocs/withSimulation";
import Select from "../../components/Select";
import Container from "../../components/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { runSimulationSessionActionServer } from "../../redux/actions/simulationActions";

const headers: Header[] = [
  {
    text: "Parameter value",
    preciseWidth: 250,
  },
  {
    text: "Parameter Standard deviation",
    preciseWidth: 250,
  },
  {
    text: "Parameter path",
    preciseWidth: 300,
    relativeWidth: "100%",
  },
];

export type FormData = {
  recordTypeId: number;
  description: string;
  filename: string;
  simulationName: string;
  simulationId: number;
};

interface Props {
  isEditMode?: boolean;
}
const initialFilters = {
  caption: "",
  search: "",
  systemType: [],
  modelType: [],
  instanceNumber: "0",
};

const AddEditMonteCarloRecord: FC<Props> = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const actionName = isEditMode ? "Edit" : "Create";
  const { simulationId, filename, description } = useParams();
  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Monte Carlo Inputs and Outputs Records", to: `${pages.monteCarloRecords()}/${simulationId}/${filename}` },
    { label: `${actionName} Record`, to: "" },
  ];

  const [units, setUnits] = useState<WidgetUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [filters, setFilters] = useState<DataBrowserFilters>(initialFilters);
  const types = useSelector(getEnumerators);

  const batchRecords = useSelector(getCurrentMonteCarloRecords);
  const simulations = useSelector(getSimulations);
  const sessionInfo = useSelector(getSessionInformation);
  const sessionId = sessionInfo?.["simulation-session-id"];
  const simulationHierarchy = useSelector(getSimulationHyrarchy);
  const systems = (simulationHierarchy?.["simulation-systems"] || []) as System[];
  const batchRecordValidationErrors = useSelector(getMonteCarloRecordValidationErrors);

  const recordTypeOptions = useMemo(
    () =>
      types?.[0]?.["enum-values"]?.map((item) => ({
        id: item["enum-value-id"],
        label: item["enum-value-string"],
      })) ?? [],
    [types],
  );

  const currentBatchRecord = useMemo(
    () => batchRecords.find((item) => item.description === description),
    [batchRecords, description],
  );

  const currentSimulation = useMemo(
    () => simulations.find((item) => item["simulation-id"] === Number(simulationId)),
    [simulations],
  );

  const [formData, setFormData] = useState<FormData>({
    recordTypeId: 0,
    description: "",
    filename: "",
    simulationName: "",
    simulationId: 0,
  });

  const [formError, setFormError] = useState<Record<string, string>>({
    recordTypeId: "",
    description: "",
  });

  const handleInputChange = (key: keyof FormData) => (e: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

    setFormError((prev) => ({
      ...prev,
      [key]: validation(key, e.target.value),
    }));
  };

  const handleSelectChange = (key: keyof typeof formData) => (value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const validation = (name: string, value: string | number) => {
    switch (name) {
      case "recordTypeId": {
        if (value === 0) return "error";
        return "";
      }
      case "description": {
        const keyRegex = /^[A-Za-z0-9_-]+$/;
        if (!value) return "Key is required.";
        if (!keyRegex.test(value as string)) return "Only A-Z, 0-9, _ and - allowed";
        return "";
      }
      default:
        return "";
    }
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
          id: `${unit.id}_${index}_parameter-stddev`,
          key: "parameter-stddev",
          title: unit["parameter-stddev"],
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
    //
  };

  const onUnitDuplicate = (id: string) => {
    //
  };

  const onUnitDelete = (id: string) => {
    //
  };

  const allParameters = useMemo(
    () => [
      ...(simulationHierarchy?.["custom-simulation-data"] || []),
      ...systems
        .reduce((acc, curr) => [...acc, ...(curr["system-models"] || [])], [] as Model[])
        .reduce((acc, curr) => [...acc, ...(curr["model-data-items"] || [])], [] as ModelDataItem[]),
    ],
    [systems],
  );

  const selectParameter = (_event: any, nodeId: string) => {
    setUnits((item) =>
      item.map((unit) => ({
        ...unit,
        "parameter-path": nodeId,
      })),
    );
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

  useEffect(() => {
    if (simulationId && filename && currentBatchRecord && currentSimulation && recordTypeOptions.length) {
      const recordTypeId = recordTypeOptions.find(
        (item) =>
          item["label"].toLowerCase().indexOf(currentBatchRecord["record-type"].toLowerCase().split("_")[0]) == 0,
      );

      if (recordTypeId) {
        setFormData({
          ...formData,
          recordTypeId: recordTypeId["id"],
          description: currentBatchRecord.description,
          filename: filename,
          simulationId: Number(simulationId),
          simulationName: currentSimulation["simulation-name"],
        });
      }

      const units = [
        {
          id: generateWidgetUnitId(),
          "parameter-value": String(currentBatchRecord["parameter-value"]),
          "parameter-stddev": String(currentBatchRecord["parameter-stddev"]),
          "parameter-path": String(currentBatchRecord["parameter-path"]),
        },
      ];
      setUnits(units);
    }
  }, [batchRecords, currentSimulation, recordTypeOptions.length]);

  useEffect(() => {
    dispatch(updateMonteCarloRecordValidationErrors([]));
    if (sessionId)
      dispatch(
        runSimulationSessionActionServer({
          "simulation-session-id": +sessionId,
          "action-type": SimulationSessionActionType.queryStatus,
          disableLoaders: false,
        }),
      );
    if (simulationId && filename) {
      dispatch(getMonteCarloRecordsServer({ simulationId: Number(simulationId), filename: filename }));
      dispatch(getSimulationsExtendedInfoServer({ "simulation-id": Number(simulationId) }));
      dispatch(getSpecificEnumeratorServer({ "enum-type": "monte-carlo-input-output-record-type" }));
    }
    if (!isEditMode) {
      const units = [
        {
          id: generateWidgetUnitId(),
          "parameter-value": "",
          "parameter-stddev": "",
          "parameter-path": "",
        },
      ];
      setUnits(units);
    }
  }, []);

  useEffect(() => {
    if (batchRecordValidationErrors.length) {
      batchRecordValidationErrors.forEach((item) => {
        setFormError((prevState) => ({
          ...prevState,
          [item["form-field-name"]]: "",
        }));
      });
    }
  }, [batchRecordValidationErrors]);

  const handleCancel = () => {
    navigate(`${pages.monteCarloRecords()}/${simulationId}/${filename}`);
  };

  const handleSubmit = () => {
    const recordTypeIdError = validation("recordTypeId", formData.recordTypeId);
    const descriptionError = validation("description", formData.description);

    if (!recordTypeIdError && !descriptionError) {
      dispatch(
        manageMonteCarloRecordServer({
          "new-description": formData.description,
          "record-type": String(formData.recordTypeId),
          "parameter-path": units[0]?.["parameter-path"],
          "parameter-value": Number(units[0]?.["parameter-value"]),
          "parameter-stddev": Number(units[0]?.["parameter-stddev"]),
          "simulation-id": Number(simulationId),
          filename: filename,
          description: formData.description,
          "action-type": isEditMode ? "edit" : "add",
          redirect: () => navigate(`${pages.monteCarloRecords()}/${simulationId}/${filename}`),
        }),
      );
    } else {
      setFormError({ ...formError, recordTypeId: recordTypeIdError, description: descriptionError });
    }
  };

  return (
    <Wrapper>
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!batchRecordValidationErrors?.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {batchRecordValidationErrors.map((error, index) => (
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
          title="Record Type"
          content={
            <Select
              value={formData.recordTypeId}
              onChange={handleSelectChange("recordTypeId")}
              options={recordTypeOptions}
              error={formError.recordTypeId === "error"}
            />
          }
        />

        {!isEditMode && (
          <MainContainer
            key="key"
            requireField={true}
            title="Key"
            content={
              <Input
                error={!!formError.description}
                helperText={formError.description}
                placeholder={"Enter key"}
                value={formData.description}
                handleChange={handleInputChange("description")}
              />
            }
          />
        )}

        <MainContainer
          key="modified-parameters"
          title="Additional Information"
          content={
            <Grid container gap="4px" direction="column">
              {isEditMode && (
                <Typography variant="body2" color="main.100">
                  Key: {formData.description}
                </Typography>
              )}
              <Typography variant="body2" color="main.100">
                File Name: {filename}
              </Typography>
              <Typography variant="body2" color="main.100">
                Simulation Name: {currentSimulation?.["simulation-name"]}
              </Typography>
              <Typography variant="body2" color="main.100">
                Simulation ID: {simulationId}
              </Typography>
            </Grid>
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

        {!Number.isNaN(Number(sessionId)) && (
          <>
            <Box marginTop="16px">
              <BatchRecordDataBrowser
                sessionId={Number(simulationId)}
                handleNodeSelect={selectParameter}
                disableOverlay
                hideHeaderActionElements
                externalFilters={filters}
              />
            </Box>
          </>
        )}
        <Wrapper className="customHeading"></Wrapper>

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
    width: "250px !important",
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
      width: "222px !important",
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

export default withSimulation(AddEditMonteCarloRecord);
