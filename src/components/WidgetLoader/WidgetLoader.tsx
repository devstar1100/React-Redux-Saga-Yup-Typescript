import React from "react";
import { CircularProgress, Grid, styled } from "@mui/material";

const WidgetLoader = () => (
  <Wrapper>
    <Loader />
  </Wrapper>
);

const Wrapper = styled(Grid)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: "100%",
  height: "100%",
  position: "absolute",
  left: 0,
  top: 0,
  background: theme.palette.textColor.white,
  opacity: 0.5,
}));

const Loader = styled(CircularProgress)(({ theme }) => ({
  width: "60px !important",
  height: "60px !important",
  color: theme.palette.aqua[400],
}));

export default WidgetLoader;
