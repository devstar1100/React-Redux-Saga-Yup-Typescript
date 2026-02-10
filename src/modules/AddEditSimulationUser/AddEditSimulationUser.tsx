import React, { FC, ReactElement, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { format, parseISO } from "date-fns";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Grid, styled, Typography } from "@mui/material";

import Seo from "../../components/Seo/Seo";
import Input from "../../components/Inputs/Input";
import Select from "../../components/Select/Select";
import withSimulation from "../../hocs/withSimulation";
import Alert, { AlertVariant } from "../../components/Alert/Alert";
import Container from "../../components/WidgetContainer/WidgetContainer";
import ActionButtonsBlock from "../AddEditCustomView/components/ActionButtonsBlock";
import { pages } from "../../lib/routeUtils";
import { camelize } from "../../lib/camelize";
import {
  addSimulationUserServer,
  editSimulationUserServer,
  getSimulationUsersServer,
  updateSimulationUserValidationErrors,
} from "../../redux/actions/simulationUsersActions";
import { getSimulationUserValidationErrors, getSimulationUsers } from "../../redux/reducers/simulationUsersReducer";
import { getEnumeratorsServer } from "../../redux/actions/simulationsActions";
import { getEnumerators } from "../../redux/reducers/simulationsReducer";
import { Breadcrumbs, BreadcrumbsItem } from "../../components/Breadcrumbs";

interface IMainContainer {
  title: string;
  content: ReactElement;
  requireField?: boolean;
}

interface Props {
  isEditMode?: boolean;
}

const AddEditSimulationUser = ({ isEditMode = false }: Props) => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const navigate = useNavigate();
  const formPrefilledRef = useRef<boolean>(false);
  const simulationUsers = useSelector(getSimulationUsers);
  const simulationUserValidationErrors = useSelector(getSimulationUserValidationErrors);
  const enumerators = useSelector(getEnumerators);

  const currentUser = (simulationUsers || []).find((user) => Number(user["user-id"]) === Number(userId));

  const userRoleValues = enumerators?.find((enumerator) => enumerator["enum-type"] === "user-role");
  const userRoleItems = userRoleValues ? userRoleValues["enum-values"].map((value) => value["enum-value-string"]) : [];
  const userStatusValues = enumerators?.find((enumerator) => enumerator["enum-type"] === "user-statuses");
  const userStatues = userStatusValues
    ? userStatusValues["enum-values"].map((userRoleValue) => userRoleValue["enum-value-string"])
    : [];

  const initialState = {
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    repeatPassword: "",
    userRole: "",
    status: "",
    maxNumberOfSessions: 2,
    maxNumberOfProcesses: 10,
  };
  const actionName = isEditMode ? "Edit" : "Create";

  const [textFields, setTextFields] = useState<Record<string, string | number>>({
    firstName: initialState.firstName,
    lastName: initialState.lastName,
    userName: initialState.userName,
    email: initialState.email,
    password: initialState.password,
    repeatPassword: initialState.repeatPassword,
    maxNumberOfSessions: initialState.maxNumberOfSessions,
    maxNumberOfProcesses: initialState.maxNumberOfProcesses,
  });
  const [userRole, setUserRole] = useState<string>(initialState.userRole);
  const [status, setStatus] = useState<string>(initialState.status);
  const [isMissing, setIsMissing] = useState<Record<string, boolean>>({
    firstName: false,
    lastName: false,
    userName: false,
    email: false,
    password: false,
    repeatPassword: false,
    maxNumberOfSessions: false,
    maxNumberOfProcesses: false,
  });

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFields({ ...textFields, [e.target.name]: e.target.value });
    setIsMissing({ ...isMissing, [e.target.name]: !e.target.value });
  };

  useEffect(() => {
    dispatch(getEnumeratorsServer());
  }, []);

  useEffect(() => {
    dispatch(getSimulationUsersServer({ "user-id": Number(userId) }));
  }, []);

  useEffect(() => {
    if (isEditMode && currentUser && !!userRoleItems.length && !!userStatues.length && !formPrefilledRef.current) {
      prefillForm();
      formPrefilledRef.current = true;
    }
  }, [isEditMode, currentUser, userRoleItems, userStatues]);

  const resetAllErrors = () => {
    const newMissing = Object.keys(isMissing).reduce((acc, curr) => {
      return {
        ...acc,
        [curr]: false,
      };
    }, {});
    setIsMissing(newMissing);
  };

  useEffect(() => {
    if (simulationUserValidationErrors.length) {
      simulationUserValidationErrors.forEach((field) => {
        field["form-field-name"] = camelize(field["form-field-name"]);

        setIsMissing((prevState) => ({
          ...prevState,
          [field["form-field-name"]]: true,
        }));
      });
    } else {
      resetAllErrors();
    }
  }, [simulationUserValidationErrors]);

  useEffect(() => {
    if (!isEditMode && !!userRoleItems.length && !!userStatues.length && !formPrefilledRef.current) {
      setUserRole(userRoleItems[2]);
      setStatus(userStatues[0]);
      formPrefilledRef.current = true;
    }
  }, [isEditMode, userRoleItems, userStatues]);

  const clearForm = () => {
    setTextFields({
      firstName: initialState.firstName,
      lastName: initialState.lastName,
      userName: initialState.userName,
      email: initialState.email,
      password: initialState.password,
      repeatPassword: initialState.repeatPassword,
      maxNumberOfSessions: initialState.maxNumberOfSessions,
      maxNumberOfProcesses: initialState.maxNumberOfProcesses,
    });
    setUserRole(initialState.userRole);
    setStatus(initialState.status);
  };

  const prefillForm = () => {
    if (currentUser) {
      setTextFields({
        ...textFields,
        firstName: currentUser["first-name"],
        lastName: currentUser["last-name"],
        userName: currentUser["user-name"],
        email: currentUser["email"],
        maxNumberOfSessions: currentUser["max-number-of-sessions"],
        maxNumberOfProcesses: currentUser["max-number-of-processes"],
      });
      setUserRole(currentUser["user-role"]);
      setStatus(currentUser["user-status"]);
    }
  };

  const handleCancel = () => {
    if (isEditMode) prefillForm();
    else clearForm();

    navigate(pages.simulationUsers());
  };

  const handleSubmit = () => {
    if (isEditMode)
      dispatch(
        editSimulationUserServer({
          "user-id": userId as string,
          email: textFields.email as string,
          "first-name": textFields.firstName as string,
          "last-name": textFields.lastName as string,
          "user-name": textFields.userName as string,
          password: textFields.password as string,
          "repeat-password": textFields.repeatPassword as string,
          "user-role": String(userRoleItems.findIndex((el) => el === userRole) + 1),
          "user-status": String(userStatues.findIndex((el) => el === status) + 1),
          "max-number-of-sessions": textFields.maxNumberOfSessions as number,
          "max-number-of-processes": textFields.maxNumberOfProcesses as number,
          redirect: () => navigate(pages.simulationUsers()),
        }),
      );
    else
      dispatch(
        addSimulationUserServer({
          email: textFields.email as string,
          "first-name": textFields.firstName as string,
          "last-name": textFields.lastName as string,
          "user-name": textFields.userName as string,
          password: textFields.password as string,
          "repeat-password": textFields.repeatPassword as string,
          "user-role": String(userRoleItems.findIndex((el) => el === userRole) + 1),
          "user-status": String(userStatues.findIndex((el) => el === status) + 1),
          "max-number-of-sessions": textFields.maxNumberOfSessions as number,
          "max-number-of-processes": textFields.maxNumberOfProcesses as number,
          redirect: () => navigate(pages.simulationUsers()),
        }),
      );
  };

  useEffect(() => {
    dispatch(updateSimulationUserValidationErrors([]));
  }, []);

  const breadcrumbsItems: BreadcrumbsItem[] = [
    { label: "Simulation users", to: pages.simulationUsers() },
    { label: `${actionName} simulation user`, to: "" },
  ];

  return (
    <Wrapper>
      <Seo title={`${actionName} Simulation User`} />
      <Container
        breadcrumbs={<Breadcrumbs items={breadcrumbsItems} />}
        bottomActionBlock={
          <ActionButtonsBlock onConfirm={handleSubmit} onDecline={handleCancel} confirmBtnText={"Save"} />
        }
      >
        {!!simulationUserValidationErrors.length && (
          <Alert
            title="There are some errors, Please correct item below"
            variant={AlertVariant.error}
            content={
              <ListWrapper>
                {simulationUserValidationErrors.map((error, index) => (
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
          title="First Name"
          content={
            <Input
              formikName="firstName"
              error={isMissing.firstName}
              placeholder="Enter first name"
              value={textFields.firstName}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Last Name"
          content={
            <Input
              formikName="lastName"
              error={isMissing.lastName}
              placeholder="Enter last name"
              value={textFields.lastName}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="User Name"
          content={
            <Input
              formikName="userName"
              error={isMissing.userName}
              placeholder="Enter user name"
              value={textFields.userName}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="Email"
          content={
            <Input
              formikName="email"
              error={isMissing.email}
              placeholder="Enter email"
              value={textFields.email}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField={!isEditMode}
          title="Password"
          content={
            <Input
              type="password"
              formikName="password"
              error={!isEditMode ? isMissing.password : false}
              placeholder="Enter password"
              value={textFields.password}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField={!isEditMode}
          title="Repeat Password"
          content={
            <Input
              type="password"
              formikName="repeatPassword"
              error={!isEditMode ? isMissing.repeatPassword : false}
              placeholder="Enter password"
              value={textFields.repeatPassword}
              handleChange={handleTextFieldChange}
            />
          }
        />
        <MainContainer
          requireField
          title="User Role"
          content={<Select value={userRole} onChange={setUserRole} options={userRoleItems} />}
        />
        <MainContainer
          requireField
          title="Status"
          content={<Select value={status} onChange={setStatus} options={userStatues} />}
        />
        <MainContainer
          requireField
          title="Max # of sessions"
          content={
            <Input
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              formikName="maxNumberOfSessions"
              error={isMissing.maxNumberOfSessions}
              placeholder="Enter max number of sessions"
              value={textFields.maxNumberOfSessions}
              handleChange={(event) => {
                const inputValue = event.target.value;
                if (inputValue < 0) event.target.value = 0;
                handleTextFieldChange(event);
              }}
            />
          }
        />
        <MainContainer
          requireField
          title="Max # of processes"
          content={
            <Input
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              formikName="maxNumberOfProcesses"
              error={isMissing.maxNumberOfProcesses}
              placeholder="Enter max number of processes"
              value={textFields.maxNumberOfProcesses}
              handleChange={(event) => {
                const inputValue = event.target.value;
                if (inputValue < 0) event.target.value = 0;
                handleTextFieldChange(event);
              }}
            />
          }
        />
        {isEditMode && (
          <>
            <MainContainer
              title="Informations"
              content={
                <Typography variant="body2" color="main.100">
                  Internal Id: {currentUser?.["user-id"]}
                </Typography>
              }
            />
            <MainContainer
              title="Time Stamps"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    Creation date:{" "}
                    {format(parseISO(currentUser?.["creation-date"] || new Date().toISOString()), "yyyy-MM-dd HH:mm")}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Last update date:{" "}
                    {format(
                      parseISO(currentUser?.["last-update-date"] || new Date().toISOString()),
                      "yyyy-MM-dd HH:mm",
                    )}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    Last successful login:{" "}
                    {format(parseISO(currentUser?.["last-login-date"] || new Date().toISOString()), "yyyy-MM-dd HH:mm")}
                  </Typography>
                </Grid>
              }
            />
            <MainContainer
              title="Number of logins"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    # of successful logins: {currentUser?.["number-of-successful-logins"]}
                  </Typography>
                  <Typography variant="body2" color="main.100">
                    # of failed logins: {currentUser?.["number-of-failed-logins"]}
                  </Typography>
                </Grid>
              }
            />
            <MainContainer
              title="Associated projects"
              content={
                <Grid container gap="4px" direction="column">
                  <Typography variant="body2" color="main.100">
                    {currentUser?.["associated-projects"]}
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

export default withSimulation(AddEditSimulationUser);
