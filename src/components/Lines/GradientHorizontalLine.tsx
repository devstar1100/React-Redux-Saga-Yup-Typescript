import { styled } from "@mui/material";

const GradientHorizontalLine = () => <Line className="gradientHorizontalLine" />;

const Line = styled("div")({
  width: "100%",
  background: "linear-gradient(to right, rgba(35,41,53,0.01), rgba(31,31,34,0.8), rgba(35,41,53,0.01))",
  height: "2px",
});

export default GradientHorizontalLine;
