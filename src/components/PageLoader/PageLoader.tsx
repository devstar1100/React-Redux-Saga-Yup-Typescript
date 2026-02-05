import { CircularProgress, Grid, styled } from "@mui/material";
import React from "react";

const PageLoader = () => (
  <Wrapper>
    <Loader />
  </Wrapper>
);

const Wrapper = styled(Grid)(() => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
}));

const Loader = styled(CircularProgress)(({ theme }) => ({
  width: "80px !important",
  height: "80px !important",
  color: theme.palette.textColor.white,
}));

export default PageLoader;
