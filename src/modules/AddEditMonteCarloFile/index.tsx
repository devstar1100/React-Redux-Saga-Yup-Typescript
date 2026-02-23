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
import Alert, { AlertVariant } from "../../components/Alert";
import Seo from "../../components/Seo";
import Input from "../../components/Inputs";
import withSimulation from "../../hocs/withSimulation";
import Container from "../../components/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import Select from "../../components/Select";
import PageLoader from "../../components/PageLoader";

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

  const [formData, setFormData] = useState<Record<string, string | number | undefined>>({
    filename: "",
    simulationName: "",
    simulationId: 0,
    numberOfInputsRecords: 0,
    numberOfOutputsRecords: 0,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({
    filename: "",
    simulationName: "",
  });

  const handleInputChange = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [key]: e.target.value });
    setFieldErrors({ ...fieldErrors, [key]: validation(key, e.target.value) });
  };
  const handleSelectChange = (key: keyof typeof formData) => (value: string) => {
    setFormData({ ...formData, [key]: value });
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
    setFormData({ ...formData, [key]: fileName });
  };

  const handleSimulationChange = (newValue: number) => {
    setFormData({ ...formData, simulationId: newValue });
  };

  useEffect(() => {
    dispatch(getMonteCarloFilesServer());
    dispatch(getSimulationsExtendedInfoServer({}));
  }, []);

  useEffect(() => {
    setFormData({
      filename: isEditMode ? (filename as string) : "",
      simulationName: isEditMode
        ? simulationNameItems.find((item) => item.id === currentMonteCarloFile?.["simulation-id"])?.label
        : "",
      simulationId: isEditMode ? Number(currentMonteCarloFile?.["simulation-id"]) : undefined,
      numberOfInputsRecords: isEditMode ? Number(currentMonteCarloFile?.["number-of-input-records"]) : 0,
      numberOfOutputsRecords: isEditMode ? Number(currentMonteCarloFile?.["number-of-output-records"]) : 0,
    });
  }, [currentMonteCarloFile]);

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
      Object.values(formData).every((value) => String(value) !== "") &&
      isEditMode
        ? true
        : formData.simulationId !== undefined;

    if (isValid) {
      dispatch(
        manageMonteCarloFileServer({
          "simulation-id": Number(simulationId),
          "file-name": isEditMode ? (filename as string) : (formData.filename as string),
          "action-type": isEditMode ? "edit" : "add",
          "new-simulation-id": formData.simulationId as number,
          "new-filename": formData.filename as string,
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
                  value={formData.filename as string}
                  InputProps={{
                    endAdornment: (
                      <UploadWrapper>
                        <UploadIcon />
                        <UploadInput onChange={handleUploadFileName("filename")} type="file" />
                      </UploadWrapper>
                    ),
                  }}
                  handleChange={handleInputChange("filename")}
                />
              }
            />

            <MainContainer
              requireField
              title="Simulation Name"
              content={
                <Select
                  value={formData.simulationId as number}
                  onChange={handleSelectChange("simulationId")}
                  options={simulationNameItems}
                />
              }
            />

            <MainContainer
              title="Additional Information"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Simulation ID: {formData.simulationId}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Number of Input Records: {formData.numberOfInputsRecords}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Number of Output Records: {formData.numberOfOutputsRecords}
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
