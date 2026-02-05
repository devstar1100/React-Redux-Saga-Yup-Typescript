import { styled } from "@mui/material";

const GradientVerticalLine = () => <Line className="gradientVerticalLine" />;

const Line = styled("div")({
  width: "2px",
  background: "linear-gradient(to bottom, rgba(35,41,53,0.01), rgba(31,31,34,0.8), rgba(35,41,53,0.01))",
});

export default GradientVerticalLine;
