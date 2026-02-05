import { styled, Typography } from "@mui/material";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Wrapper>
        <TooltipText variant="h1">{`${payload[0].value}`}</TooltipText>
      </Wrapper>
    );
  }

  return null;
};

export const Wrapper = styled("div")(({ theme }) => ({
  backgroundColor: "#000",
  opacity: 0.6,
  borderRadius: "15px",
  border: "none",
  outline: "none",
  padding: "4px 10px",
}));

export const TooltipText = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export { CustomTooltip };
