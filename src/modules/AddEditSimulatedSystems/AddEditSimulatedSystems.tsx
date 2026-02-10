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
import useGetEnumeratorOptions from "../../hooks/useGetEnumeratorOptions";
import { DEFAULT_HIGH_LEVEL_SYSTEM_OR_MODEL_ID } from "../AddEditSimulatedModel/static/constants";
import { updateSimulationValidationErrors } from "../../redux/actions/simulationActions";
import { getSimulationsServer, getEnumeratorsServer } from "../../redux/actions/simulationsActions";
import { getSimulations, getEnumerators } from "../../redux/reducers/simulationsReducer";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import {
  getSimulatedSystemsValidationErrors,
  getStoredSimulatedSystems,
} from "../../redux/reducers/simulatedSystemsReducer";
import {
  addSimulatedSystemServer,
  editSimulatedSystemServer,
  fetchSimulatedSystemsServer,
  setSimulatedSystemsValidationErrors,
} from "../../redux/actions/simulatedSystemsActions";
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
  simulationName: "",
  systemClassName: "",
  systemAlias: "",
  systemPlurality: 1,
};

const AddEditSimulatedSystems = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { modelId, simulationName } = useParams();
  const navigate = useNavigate();
  const formPrefilledRef = useRef<boolean>(false);
  const simulations = useSelector(getSimulations);
  const enumerators = useSelector(getEnumerators);
  const simulatedSystemsValidationErrors = useSelector(getSimulatedSystemsValidationErrors);
  const simulatedSystems = useSelector(getStoredSimulatedSystems);

  const [highLevelSystems, highLevelSystemsOptions] = useGetEnumeratorOptions({
    enumerators,
    enumType: "high-level-systems",
  });

  const currentSimulatedSystem = (simulatedSystems || []).find((node) => Number(node["model-id"]) === Number(modelId));

  const actionName = isEditMode ? "Edit" : "Create";

  const simulationsOptions = simulations.map((item) => item["simulation-name"]);

  const [textFields, setTextFields] = useState<Record<string, string | number>>({
    systemPlurality: initialState.systemPlurality,
  });
  const [isMissing, setIsMissing] = useState<Record<string, boolean>>({
    systemPlurality: false,
  });

  const [simulationNameValue, setSimulationNameValue] = useState<string>(initialState.simulationName);

  const [systemClassName, setSystemClassName] = useState<string>(initialState.systemClassName);
  const [systemClassNameError, setSystemClassNameError] = useState<boolean>(false);

  const [systemAlias, setSystemAlias] = useState<string>(initialState.systemAlias);

  const [highLevelSystemValue, setHighLevelSystemValue] = useState<string>("");

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFields({ ...textFields, [e.target.name]: e.target.value });
    setIsMissing({ ...isMissing, [e.target.name]: !e.target.value });
  };

  const validateSystemClassName = (name: string) => {
    const maxLength = 64;
    const regex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

    if (name.length === 0 || name.length > maxLength || !regex.test(name)) {
      return true;
    }
    return false;
  };

  const convertToModelAlias = (systemClassName: string) => {
    let modelAlias = "";

    for (let i = 0; i < systemClassName.length; i++) {
      const char = systemClassName[i];
      const prevChar = i > 0 ? systemClassName[i - 1] : "";

      if (
        i > 0 &&
        ((/[a-z]/.test(prevChar) && /[A-Z0-9]/.test(char)) ||
          (/[A-Z]/.test(prevChar) && /[0-9]/.test(char)) ||
          (/[0-9]/.test(prevChar) && /[a-zA-Z]/.test(char)))
      ) {
        modelAlias += "_";
      }

      modelAlias += char.toLowerCase();
    }

    return modelAlias;
  };

  const getHighLevelSystemId = () => {
    if (!highLevelSystems || !highLevelSystemValue) return DEFAULT_HIGH_LEVEL_SYSTEM_OR_MODEL_ID;

    return (
      highLevelSystems["enum-values"].find((item) => item["enum-value-string"] === highLevelSystemValue)?.[
        "enum-value-id"
      ] || DEFAULT_HIGH_LEVEL_SYSTEM_OR_MODEL_ID
    );
  };

  const handleClassNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const error = validateSystemClassName(value);
    setSystemClassNameError(error);
    setSystemClassName(value);
    setSystemAlias(convertToModelAlias(value));
  };

  const resetAllErrors = () => {
    const newMissing = Object.keys(isMissing).reduce((acc, curr) => {
      return {
        ...acc,
        [curr]: false,
      };
    }, {});
    setIsMissing(newMissing);
  };

  const clearForm = () => {
    setTextFields({
      systemPlurality: initialState.systemPlurality,
    });
  };

  const prefillForm = () => {
    if (currentSimulatedSystem) {
      setTextFields({
        systemPlurality: currentSimulatedSystem["plurality"],
      });
      setSimulationNameValue(currentSimulatedSystem["simulation-name"]);
      setSystemClassName(currentSimulatedSystem["model-class-name"]);
      setSystemAlias(currentSimulatedSystem["model-alias"]);
      // Map from high-level-model to high-level-system display value
      if (
        currentSimulatedSystem["high-level-model"] !== undefined &&
        currentSimulatedSystem["high-level-model"] !== null &&
        highLevelSystems
      ) {
        const modelValue = highLevelSystems["enum-values"].find(
          (item) => item["enum-value-id"] === currentSimulatedSystem["high-level-model"],
        );
        setHighLevelSystemValue(modelValue?.["enum-value-string"] || "");
      }
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(pages.simulatedSystems(simulationName || "unknown"));
  };

  const handleSubmit = () => {
    const highLevelSystemId = getHighLevelSystemId();

    if (isEditMode) {
      dispatch(
        editSimulatedSystemServer({
          "simulation-name": simulationNameValue,
          data: {
            "model-class-name": systemClassName,
            "model-alias": systemAlias,
            plurality: +textFields.systemPlurality,
            "system-or-model-type": 1,
            "model-frequency": 1,
            "number-of-steps-per-tick": 1,
            "has-formal-interfaces": false,
            "input-data-age": "1",
            "execution-group-order": "1",
            "high-level-model": highLevelSystemId.toString(),
          },
          redirect: () => navigate(pages.simulatedSystems(simulationNameValue)),
          "model-id": Number(modelId),
        }),
      );
    }

    if (!isEditMode) {
      dispatch(
        addSimulatedSystemServer({
          data: {
            "model-class-name": systemClassName,
            "model-alias": systemAlias,
            plurality: +textFields.systemPlurality,
            "system-or-model-type": 1,
            "model-frequency": 1,
            "number-of-steps-per-tick": 1,
            "has-formal-interfaces": false,
            "input-data-age": "1",
            "execution-group-order": "1",
            "high-level-model": highLevelSystemId.toString(),
          },
          "simulation-name": simulationNameValue,
          redirect: () => navigate(pages.simulatedSystems(simulationNameValue)),
        }),
      );
    }
  };

  useEffect(() => {
    dispatch(updateSimulationValidationErrors([]));
    dispatch(getSimulationsServer({}));
    dispatch(getEnumeratorsServer());

    return () => {
      dispatch(setSimulatedSystemsValidationErrors([]));
    };
  }, []);

  useEffect(() => {
    if (simulatedSystemsValidationErrors.length) {
      simulatedSystemsValidationErrors.forEach((field) => {
        field["form-field-name"] = camelize(field["form-field-name"]);

        setIsMissing((prevState) => ({
          ...prevState,
          [field["form-field-name"]]: true,
        }));
      });
    } else {
      resetAllErrors();
    }
  }, [simulatedSystemsValidationErrors]);

  useEffect(() => {
    if (!simulationName) return;
    dispatch(fetchSimulatedSystemsServer({ "simulation-name": simulationName }));
  }, [simulationName]);

  useEffect(() => {
    if (isEditMode && currentSimulatedSystem && !formPrefilledRef.current && highLevelSystems) {
      prefillForm();
      formPrefilledRef.current = true;
      return;
    }
    if (simulationName) setSimulationNameValue(simulationName);
  }, [isEditMode, currentSimulatedSystem, highLevelSystems]);

  useEffect(() => {
    if (!isEditMode && !formPrefilledRef.current) {
      formPrefilledRef.current = true;
    }
  }, [isEditMode]);

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Simulated systems", to: pages.simulatedSystems(simulationNameValue) },
    { label: `${actionName} simulated system`, to: "" },
  ];

  return (
    <Wrapper>
      <Seo title={`${actionName} Simulation`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!simulatedSystemsValidationErrors.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {simulatedSystemsValidationErrors.map((error, index) => (
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
            <Select value={simulationNameValue} onChange={setSimulationNameValue} options={simulationsOptions} />
          }
        />
        <MainContainer
          requireField
          title="System Class Name"
          content={
            <Input
              error={systemClassNameError}
              placeholder="Enter system class name"
              value={systemClassName}
              handleChange={handleClassNameChange}
            />
          }
        />
        <MainContainer
          title="System Alias"
          content={
            <Input placeholder="Enter system alias" value={systemAlias} handleChange={handleTextFieldChange} disabled />
          }
        />
        <MainContainer
          title="High-level system type"
          content={
            <LongSelectWrapper>
              <Select
                value={highLevelSystemValue}
                onChange={setHighLevelSystemValue}
                options={highLevelSystemsOptions}
              />
            </LongSelectWrapper>
          }
        />
        <MainContainer
          requireField
          title="System plurality"
          content={
            <Input
              formikName="systemPlurality"
              error={isMissing.systemPlurality}
              placeholder="Enter system plurality"
              value={textFields.systemPlurality}
              handleChange={handleTextFieldChange}
              type="number"
            />
          }
        />
        <MainContainer
          title="Additional Information"
          content={
            <Grid container gap="4px" direction="column">
              <Typography variant="body2" color="main.100">
                Internal Id: {currentSimulatedSystem?.["model-id"]}
              </Typography>
              <Typography variant="body2" color="main.100">
                Creation date:{" "}
                {format(
                  parseISO(currentSimulatedSystem?.["creation-date"] || new Date().toISOString()),
                  "yyyy-MM-dd HH:mm",
                )}
              </Typography>
              <Typography variant="body2" color="main.100">
                Last update date:{" "}
                {format(
                  parseISO(currentSimulatedSystem?.["last-update-date"] || new Date().toISOString()),
                  "yyyy-MM-dd HH:mm",
                )}
              </Typography>
              <Typography variant="body2" color="main.100">
                # of input messages: {currentSimulatedSystem?.["number-of-input-messages"]}
              </Typography>
              <Typography variant="body2" color="main.100">
                # of output messages: {currentSimulatedSystem?.["number-of-output-messages"]}
              </Typography>
            </Grid>
          }
        />
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

export default withSimulation(AddEditSimulatedSystems);
