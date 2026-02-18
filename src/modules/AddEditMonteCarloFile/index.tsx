import React, { ChangeEvent, FC, ReactElement, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { useParams } from "react-router-dom";
import { Box, Grid, styled, Typography } from "@mui/material";
import { pages } from "../../lib/routeUtils";
import { getSimulationsExtendedInfoServer } from "../../redux/actions/simulationsActions";
import { getSimulations } from "../../redux/reducers/simulationsReducer";
import { UploadIcon } from "../../components/Icons/UploadIcon";
import { getMonteCarloFilesServer, manageMonteCarloFileServer } from "../../redux/actions/monteCarloFilesActions";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";
import {
  getCurrentMonteCarloFiles,
  getIsMonteCarloFilesLoading,
  getMonteCarloFileValidationErrors,
} from "../../redux/reducers/monteCarloFilesReducer";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import Seo from "../../components/Seo/Seo";
import Input from "../../components/Inputs/Input";
import withSimulation from "../../hocs/withSimulation";
import Container from "../../components/WidgetContainer/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import Select from "../../components/Select";
import PageLoader from "../../components/PageLoader/PageLoader";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
  description?: ReactElement;
}

interface Props {
  isEditMode?: boolean;
}

const AddEditMonteCarloFile = ({ isEditMode = false }: Props) => {
  const actionName = isEditMode ? "Edit" : "Create";
  const dispatch = useDispatch();
  const { simulationId, filename } = useParams();

  const navigate = useNavigate();
  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Monte Carlo Inputs and Outputs Files", to: pages.monteCarloFiles() },
    { label: `${actionName} File`, to: "" },
  ];
  const simulations = useSelector(getSimulations);
  const monteCarloFiles = useSelector(getCurrentMonteCarloFiles);
  const isloading = useSelector(getIsMonteCarloFilesLoading);
  const monteCarloFileValidationErrors = useSelector(getMonteCarloFileValidationErrors);

  const currentMonteCarloFile = monteCarloFiles.find(
    (item) => Number(item["simulation-id"]) === Number(simulationId) && item.name === filename,
  );
  const simulationNameItems = simulations.map((simulation) => ({
    id: simulation["simulation-id"],
    label: simulation["simulation-name"],
  }));

  const [textFields, setTextFields] = useState<Record<string, string | number>>({
    filename: "",
    simulationName: "",
  });
  const [fieldSimulationId, setFieldSimulationId] = useState<number>(isEditMode ? Number(simulationId) : -1);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({
    filename: "",
    simulationName: "",
  });

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFields({ ...textFields, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: validation(e.target.name, e.target.value) });
  };

  const validation = (name: string, value: string | number) => {
    switch (name) {
      case "filename": {
        if (!value) return "File Name is required.";
        return "";
      }
      case "simulationName": {
        if (!value) return "Simulation Name is required.";
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
  };

  useEffect(() => {
    dispatch(getMonteCarloFilesServer());
    dispatch(getSimulationsExtendedInfoServer({}));
    setTextFields({
      filename: isEditMode ? (filename as string) : "",
      simulationName: "",
    });
  }, []);

  useEffect(() => {
    if (monteCarloFileValidationErrors.length) {
      monteCarloFileValidationErrors.forEach((item) => {
        setFieldErrors((prevState) => ({
          ...prevState,
          [item["form-field-name"]]: "",
        }));
      });
    }
  }, [monteCarloFileValidationErrors]);

  const handleCancel = () => {
    navigate(pages.monteCarloFiles());
  };

  const handleSubmit = () => {
    const isValid =
      Object.values(fieldErrors).every((error) => error === "") &&
      Object.values(textFields).every((value) => String(value) !== "") &&
      isEditMode
        ? true
        : fieldSimulationId !== -1;

    if (isValid) {
      dispatch(
        manageMonteCarloFileServer({
          "simulation-id": fieldSimulationId,
          "file-name": isEditMode ? (filename as string) : (textFields.filename as string),
          "action-type": isEditMode ? "edit" : "add",
          "new-simulation-id": fieldSimulationId,
          "new-filename": textFields.filename as string,
          redirect: () => navigate(pages.monteCarloFiles()),
        }),
      );
    }
  };

  return (
    <Wrapper>
      <Seo title={`${actionName} MonteCarloBach`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {isloading ? (
          <Box p="100px 0">
            <PageLoader />
          </Box>
        ) : (
          <>
            {!!monteCarloFileValidationErrors.length && (
              <Alert
                title="There are some errors, Please correct item below"
                variant={AlertVariant.error}
                content={
                  <ListWrapper>
                    {monteCarloFileValidationErrors.map((error, index) => (
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
              title="File Name"
              content={
                <Input
                  formikName="filename"
                  error={!!fieldErrors.filename}
                  helperText={fieldErrors.filename}
                  placeholder="Enter input/Output Parameters File"
                  value={textFields.filename}
                  InputProps={{
                    endAdornment: (
                      <UploadWrapper>
                        <UploadIcon />
                        <UploadInput onChange={handleUploadFileName("filename")} type="file" />
                      </UploadWrapper>
                    ),
                  }}
                  handleChange={handleTextFieldChange}
                />
              }
            />

            <MainContainer
              requireField
              title="Simulation Name"
              content={
                <Select value={fieldSimulationId} onChange={setFieldSimulationId} options={simulationNameItems} />
              }
            />

            <MainContainer
              title="Additional Information"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Simulation ID: {fieldSimulationId !== -1 ? fieldSimulationId : undefined}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Number of Input Records: {currentMonteCarloFile?.["number-of-input-records"] || 0}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Number of Output Records: {currentMonteCarloFile?.["number-of-output-records"] || 0}
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

export default withSimulation(AddEditMonteCarloFile);
