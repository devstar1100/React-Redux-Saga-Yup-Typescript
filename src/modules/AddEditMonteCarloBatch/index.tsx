import React, { ChangeEvent, FC, ReactElement, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { Grid, styled, Typography } from "@mui/material";

import Seo from "../../components/Seo";
import Input from "../../components/Inputs";
import withSimulation from "../../hocs/withSimulation";
import Container from "../../components/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { pages } from "../../lib/routeUtils";
import { getSimulationsExtendedInfoServer } from "../../redux/actions/simulationsActions";
import { getSimulations } from "../../redux/reducers/simulationsReducer";
import Alert, { AlertVariant } from "../../components/Alert";
import { getMonteCarloBatchesListServer } from "../../redux/actions/monteCarloBatchesActions";
import {
  getMonteCarloBatches,
  getMonteCarloBatchValidationErrors,
} from "../../redux/reducers/monteCarloBatchesReducer";
import { addEditMonteCarloBatchServer } from "../../redux/actions/monteCarloBatchActions";
import { updateSimulationValidationErrors } from "../../redux/actions/simulationActions";
import { UploadIcon } from "../../components/Icons/UploadIcon";
import { getUserData } from "../../redux/reducers/authReducer";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";
import Select from "../../components/Select";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
  description?: ReactElement;
}

interface Props {
  isEditMode?: boolean;
}

const initialState = {
  simulationName: "",
  runPrefix: "",
  parametersFile: "",
  numberOfPlannedRuns: 10,
  maximumExecutionTime: 60,
  sleepSecondsBetweenRuns: 0.0,
  masterSeed: 123456,
  executionSpeed: 1.0,
};

const AddEditMonteCarloBatch = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { batchId } = useParams();
  const navigate = useNavigate();
  const formPrefilledRef = useRef<boolean>(false);
  const userData = useSelector(getUserData);
  const simulations = useSelector(getSimulations);
  const monteCarloBatchValidationErrors = useSelector(getMonteCarloBatchValidationErrors);
  const monteCarloBatches = useSelector(getMonteCarloBatches);
  const currentMonteCarloBatch = (monteCarloBatches || []).find((node) => Number(node["batch-id"]) === Number(batchId));
  const currentSimulation = simulations.find(
    (node) => Number(node["simulation-id"]) === Number(currentMonteCarloBatch?.["simulation-id"]),
  );
  const simulationNameItems = simulations.map((simulation) => ({
    id: simulation["simulation-id"],
    label: simulation["simulation-name"],
  }));

  const actionName = isEditMode ? "Edit" : "Create";
  const [textFields, setTextFields] = useState<Record<string, string | number>>({
    runPrefix: initialState.runPrefix,
    parametersFile: initialState.parametersFile,
    numberOfPlannedRuns: initialState.numberOfPlannedRuns,
    maximumExecutionTime: initialState.maximumExecutionTime,
    sleepSecondsBetweenRuns: initialState.sleepSecondsBetweenRuns,
    masterSeed: initialState.masterSeed,
    executionSpeed: initialState.executionSpeed,
  });

  const [simulationId, setSimulationId] = useState<number>(-1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({
    runPrefix: "",
    parametersFile: "",
    numberOfPlannedRuns: "",
    maximumExecutionTime: "",
    sleepSecondsBetweenRuns: "",
    masterSeed: "",
    executionSpeed: "",
  });

  const isAllDataExist = !!simulationNameItems.length;

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFields({ ...textFields, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: validation(e.target.name, e.target.value) });
  };

  const validation = (name: string, value: string | number) => {
    switch (name) {
      case "parametersFile": {
        if (!value) return "Run Prefix is required.";
        return "";
      }
      case "runPrefix": {
        if (!value) return "Run Prefix is required.";
        if (/^[A-Za-z0-9_-]+$/.test(String(value)) === false) return "Only letters, numbers, '-' and '_' are allowed.";
        return "";
      }
      case "numberOfPlannedRuns": {
        if (!value) return "Number of Planned Runs is required.";
        if (!Number.isInteger(Number(value)) || Number(value) <= 0) return "Enter a positive integer greater than 0.";
        return "";
      }
      case "maximumExecutionTime": {
        if (!value) return "Maximum Execution Time is required.";
        if (!Number.isFinite(Number(value)) || Number(value) <= 0) return "Enter a number greater than 0.";
        return "";
      }
      case "sleepSecondsBetweenRuns": {
        if (!value) return "Sleep seconds between runs is required.";
        if (!Number.isFinite(Number(value)) || Number(value) < 0) return "Enter a number ≥ 0.";
        return "";
      }
      case "masterSeed": {
        if (!value) return "Master Seed is required.";
        if (!Number.isInteger(Number(value)) || Number(value) <= 0) return "Enter a positive integer greater than 0.";
        return "";
      }
      case "executionSpeed": {
        if (!value) return "Execution Speed is required.";
        if (!Number.isFinite(Number(value)) || Number(value) < 0) return "Enter 0.0 or a positive number.";
        return "";
      }
      default:
        return "";
    }
  };

  const handleUploadFileName = (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const fileName = e.target.files?.[0].name;
    if (!fileName) return;

    setTextFields({ ...textFields, [key]: fileName });
    e.target.value = null as any;
  };

  useEffect(() => {
    dispatch(getMonteCarloBatchesListServer());
    dispatch(getSimulationsExtendedInfoServer({}));
  }, []);

  useEffect(() => {
    if (isEditMode && currentMonteCarloBatch && isAllDataExist && !formPrefilledRef.current) {
      prefillForm();
      formPrefilledRef.current = true;
    }
  }, [isEditMode, currentMonteCarloBatch, isAllDataExist, formPrefilledRef]);

  const resetAllErrors = () => {
    const newMissing = Object.keys(fieldErrors).reduce((acc, curr) => {
      return {
        ...acc,
        [curr]: "",
      };
    }, {});
    setFieldErrors(newMissing);
  };

  useEffect(() => {
    if (monteCarloBatchValidationErrors.length) {
      monteCarloBatchValidationErrors.forEach((field) => {
        setFieldErrors((prevState) => ({
          ...prevState,
          [field["form-field-name"]]: "",
        }));
      });
    } else {
      resetAllErrors();
    }
  }, [monteCarloBatchValidationErrors]);

  const clearForm = () => {
    if (currentSimulation) {
      setTextFields({
        simulationName: initialState.simulationName,
        runPrefix: initialState.runPrefix,
        parametersFile: initialState.parametersFile,
        numberOfPlannedRuns: initialState.numberOfPlannedRuns,
        maximumExecutionTime: initialState.maximumExecutionTime,
        sleepSecondsBetweenRuns: initialState.sleepSecondsBetweenRuns,
        MasterSeed: initialState.masterSeed,
        executionSpeed: initialState.executionSpeed,
      });
      setSimulationId(currentSimulation["simulation-id"]);
    }
  };

  const prefillForm = () => {
    if (currentMonteCarloBatch && currentSimulation) {
      setTextFields({
        simulationName: currentMonteCarloBatch["simulation-name"],
        runPrefix: currentMonteCarloBatch["run-prefix"],
        parametersFile: currentMonteCarloBatch["input-output-parameters-file-name"],
        numberOfPlannedRuns: currentMonteCarloBatch["number-of-planned-runs"],
        maximumExecutionTime: currentMonteCarloBatch["max-execution-time-sec"],
        sleepSecondsBetweenRuns: currentMonteCarloBatch["sleep-seconds-between-runs"],
        masterSeed: currentMonteCarloBatch["master-seed"],
        executionSpeed: currentMonteCarloBatch["execution-speed"],
      });
      setSimulationId(currentSimulation?.["simulation-id"]);
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();
    navigate(pages.monteCarloBatch());
  };

  const handleSubmit = () => {
    const isValid =
      Object.values(fieldErrors).every((error) => error.trim() === "") &&
      Object.values(textFields).every((value) => String(value).trim() !== "") &&
      simulationId !== -1;

    if (isValid) {
      dispatch(
        addEditMonteCarloBatchServer({
          actionType: isEditMode ? "edit" : "add",
          "user-id": userData["user-id"],
          "batch-id": isEditMode ? Number(batchId) : 0,
          "simulation-id": simulationId,
          "run-prefix": textFields.runPrefix as string,
          "input-output-parameters-file-name": textFields.parametersFile as string,
          "number-of-planned-runs": textFields.numberOfPlannedRuns as number,
          "sleep-seconds-between-runs": textFields.sleepSecondsBetweenRuns as number,
          "master-seed": textFields.masterSeed as number,
          "max-execution-time-sec": textFields.maximumExecutionTime as number,
          "execution-speed": textFields.executionSpeed as number,
          redirect: () => navigate("/monte-carlo-batches-config"),
        }),
      );
    }
  };

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Monte Carlo Batches", to: pages.monteCarloBatch() },
    { label: `${actionName} Batch`, to: "" },
  ];

  useEffect(() => {
    dispatch(updateSimulationValidationErrors([]));
  }, []);

  return (
    <Wrapper>
      <Seo title={`${actionName} MonteCarloBach`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!monteCarloBatchValidationErrors.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {monteCarloBatchValidationErrors.map((error, index) => (
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
          content={<Select value={simulationId} onChange={setSimulationId} options={simulationNameItems} />}
        />
        <MainContainer
          requireField
          title="Run Prefix"
          content={
            <Input
              formikName="runPrefix"
              error={!!fieldErrors.runPrefix}
              helperText={fieldErrors.runPrefix}
              placeholder="Enter run Prefix"
              value={textFields.runPrefix}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Input/Output Parameters File"
          content={
            <Input
              formikName="parametersFile"
              error={!!fieldErrors.parametersFile}
              helperText={fieldErrors.parametersFile}
              placeholder="Enter input/Output Parameters File"
              value={textFields.parametersFile}
              InputProps={{
                endAdornment: (
                  <UploadWrapper>
                    <UploadIcon />
                    <UploadInput onChange={handleUploadFileName("parametersFile")} type="file" />
                  </UploadWrapper>
                ),
              }}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Number of Planned Runs"
          content={
            <Input
              formikName="numberOfPlannedRuns"
              error={!!fieldErrors.numberOfPlannedRuns}
              helperText={fieldErrors.numberOfPlannedRuns}
              placeholder="Enter number of Planned Runs"
              value={textFields.numberOfPlannedRuns}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Maximum Execution Time, seconds"
          content={
            <Input
              formikName="maximumExecutionTime"
              error={!!fieldErrors.maximumExecutionTime}
              helperText={fieldErrors.maximumExecutionTime}
              placeholder="Enter maximum Execution Time, seconds"
              value={textFields.maximumExecutionTime}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Sleep seconds between runs"
          content={
            <Input
              formikName="sleepSecondsBetweenRuns"
              error={!!fieldErrors.sleepSecondsBetweenRuns}
              helperText={fieldErrors.sleepSecondsBetweenRuns}
              placeholder="Enter sleep seconds between runs"
              value={textFields.sleepSecondsBetweenRuns}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Master Seed"
          content={
            <Input
              formikName="masterSeed"
              error={!!fieldErrors.masterSeed}
              helperText={fieldErrors.masterSeed}
              placeholder="Enter master Seed"
              value={textFields.masterSeed}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Execution Speed"
          content={
            <>
              <Input
                formikName="executionSpeed"
                error={!!fieldErrors.executionSpeed}
                helperText={fieldErrors.executionSpeed}
                placeholder="Enter execution Speed"
                value={textFields.executionSpeed}
                handleChange={handleTextFieldChange}
              />
            </>
          }
          description={
            <Typography
              sx={{
                width: {
                  xs: "100%",
                  sm: 100,
                  md: 400,
                },
                px: 2,
              }}
            >
              Set 0.0 for as-fast-aspossible, or any other positive number for specific-speed
            </Typography>
          }
        />

        {isEditMode && (
          <>
            <MainContainer
              title="Additional Information"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Batch ID {currentMonteCarloBatch?.["batch-id"]}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Simulation ID {currentMonteCarloBatch?.["simulation-id"]}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    User ID {currentMonteCarloBatch?.["user-id"]}:
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

const MainContainer: FC<IMainContainer> = ({ title, content, requireField, description }): ReactElement => (
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
    <Grid>{description}</Grid>
  </Grid>
);

const Wrapper = styled(Grid, {
  shouldForwardProp: (prop) => prop !== "isEditMode",
})<{ isEditMode?: boolean }>(({ theme }) => ({
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
