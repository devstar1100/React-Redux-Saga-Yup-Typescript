import { Grid, styled, Typography } from "@mui/material";
import { useFormik } from "formik";
import { useDispatch, useSelector } from "react-redux";
import { FocusEvent, useEffect } from "react";
import { redirect } from "react-router-dom";

import Logo from "../../components/Icons/Logo";
import Modal from "../../components/NamedBlock/NamedBlock";
import { logInServer } from "../../redux/actions/authActions";
import { logInSchema, LogInTypes, logInValues } from "../../validation/loginSchema";
import Input from "../../components/Inputs/Input";
import Seo from "../../components/Seo/Seo";
import { getIsAuthLoading, getIsAuthorized } from "../../redux/reducers/authReducer";
import { getIsHydrated } from "../../redux/reducers/appReducer";

const LoginPage = () => {
  const isAuthorized = useSelector(getIsAuthorized);
  const isHydrated = useSelector(getIsHydrated);
  const isAuthLoading = useSelector(getIsAuthLoading);

  const dispatch = useDispatch();

  const handleSubmit = (values: LogInTypes) => {
    dispatch(
      logInServer({
        "user-name": values.username,
        password: values.password,
      }),
    );
  };

  const handleBlur = (e: FocusEvent<HTMLTextAreaElement | HTMLInputElement, Element>) => {
    formik.handleBlur(e);
    (e.relatedTarget as HTMLElement)?.click();
  };

  const formik = useFormik({
    initialValues: logInValues,
    validationSchema: logInSchema,
    onSubmit: handleSubmit,
  });

  useEffect(() => {
    if (isHydrated && !isAuthorized) redirect("/");
  }, [isAuthorized, isHydrated]);

  return (
    <>
      <Seo title="Login Page" />
      <Wrapper>
        <Header>
          <Grid maxWidth={1440} margin="0 auto" width={"100%"}>
            <Logo />
          </Grid>
        </Header>
        <ModalSection>
          <Modal
            onSubmit={formik.handleSubmit}
            title="Welcome to Sim.Space"
            subtitle="Please enter your info below to login."
            isLoading={isAuthLoading}
          >
            <Inputs>
              <Input
                fullWidth
                placeholder="Enter username"
                label="Username"
                value={formik.values.username}
                handleChange={formik.handleChange}
                formikName="username"
                error={formik.errors.username && formik.touched.username ? !!formik.errors.username : undefined}
                helperText={formik.errors.username}
                onBlur={handleBlur}
              />
              <PasswordWrapper>
                <Input
                  fullWidth
                  placeholder="Enter password"
                  label="Password"
                  type="password"
                  value={formik.values.password}
                  handleChange={formik.handleChange}
                  formikName="password"
                  error={formik.errors.password && formik.touched.password ? !!formik.errors.password : undefined}
                  helperText={formik.errors.password}
                  onBlur={handleBlur}
                />
                <ResetPassword>Forget Password?</ResetPassword>
              </PasswordWrapper>
            </Inputs>
          </Modal>
        </ModalSection>
        <Copyright>© Sim Dot Space Ltd.</Copyright>
      </Wrapper>
    </>
  );
};

const Wrapper = styled("div")(({ theme }) => ({
  width: "100%",
  height: "100vh",
  backgroundColor: theme.palette.main[800],
  display: "flex",
  flexDirection: "column",
}));

const Header = styled("div")(({ theme }) => ({
  padding: "16px 40px",
  borderBottom: `1px solid ${theme.palette.additional[700]}`,
}));

const ModalSection = styled("section")(({ theme }) => ({
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const Copyright = styled("div")(({ theme }) => ({
  padding: "24px",
  textAlign: "center",
  color: theme.palette.main[400],
  borderTop: `1px solid ${theme.palette.additional[700]}`,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: theme.typography.body1.fontWeight,
  lineHeight: theme.typography.body1.lineHeight,
}));

const Inputs = styled("div")({
  width: "455px",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  position: "relative",
});

const ResetPassword = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.body2.fontWeight,
  lineHeight: theme.typography.body2.lineHeight,
  color: theme.palette.main[50],
  cursor: "pointer",
  zIndex: 2,
}));

const PasswordWrapper = styled("div")({
  position: "relative",
});

export default LoginPage;
