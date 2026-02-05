import { styled } from "@mui/system";

const VerticalGrayLine = () => <Line className="verticalGrayLine" />;

const Line = styled("div")(({ theme }) => ({
  width: "1px",
  background: theme.palette.main[200],
  height: "40px",
}));
export default VerticalGrayLine;
