import { CircularProgress, styled, Typography } from "@mui/material";
import { FC, ReactNode } from "react";
import Button from "../Button/Button";

interface Props {
  children: ReactNode;
  onSubmit: any;
  title: string;
  subtitle: string;
  isLoading?: boolean;
}

const Modal: FC<Props> = ({ children, onSubmit, title, subtitle, isLoading = false }) => (
  <Wrapper onSubmit={onSubmit}>
    <Title>{title}</Title>
    <SubTitle>{subtitle}</SubTitle>
    <Content>{children}</Content>
    <Button color="blue" fullWidth size="large" type="submit">
      {!isLoading ? "Login" : <CircularProgress sx={{ color: "#fff" }} />}
    </Button>
  </Wrapper>
);

const Title = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.title.fontSize,
  fontWeight: theme.typography.title.fontWeight,
  fontFamily: theme.typography.fontFamily,
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.main[200],
  marginTop: "8px",
}));

const Content = styled("div")({
  margin: "22px 0",
});

const Wrapper = styled("form")(({ theme }) => ({
  padding: "40px",
  borderRadius: "10px",
  backgroundColor: theme.palette.main[600],
  border: `1px solid ${theme.palette.additional[700]}`,
}));

export default Modal;
