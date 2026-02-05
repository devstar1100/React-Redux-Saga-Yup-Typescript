import { styled } from "@mui/system";

const HorizontalGrayLine = () => <Line className="horizontalGrayLine" />;

const Line = styled("div")(({ theme }) => ({
  width: "100%",
  background: theme.palette.additional[700],
  height: "1px",
}));
export default HorizontalGrayLine;
