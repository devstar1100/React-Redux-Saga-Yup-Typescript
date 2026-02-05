import { Box, Grid, styled, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useSelector } from "react-redux";

import IconDone from "../../../components/Icons/IconDone";
import { getGridTemplateTitleByName } from "../../../lib/getGridTemplateTitleByName";
import { GridTemplateName } from "../../../types/customViews";
import { getAreGridTemplatesLoading, getCustomViewGridTemplates } from "../../../redux/reducers/customViewsReducer";
import WidgetLoader from "../../../components/WidgetLoader/WidgetLoader";

interface Props {
  value: number;
  onChange: (nextValue: number) => void;
}

const GridTemplate = ({ value, onChange }: Props) => {
  const templates = useSelector(getCustomViewGridTemplates);
  const areTemplatesLoading = useSelector(getAreGridTemplatesLoading);

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newGridVariant: number) =>
    newGridVariant !== null && onChange(newGridVariant);

  return !areTemplatesLoading ? (
    <Wrapper container gap="12px" flexWrap="nowrap" direction="column">
      <ToggleButtonGroup color="primary" value={value} exclusive onChange={handleChange} aria-label="Platform">
        {(templates || []).map((template) => (
          <ToggleButton
            disableRipple
            value={template["custom-view-grid-template-id"]}
            key={template["custom-view-grid-template-name"]}
          >
            <IconDone />
            <img src={template["thumbnail-path"]} alt="gap" className="gridImg" />
            <Typography variant="subtitle1" color="grey.100">
              {getGridTemplateTitleByName(template["custom-view-grid-template-name"] as GridTemplateName)}
            </Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Typography variant="body2" color="blue.300" mb="10px">
        View more templates
      </Typography>
    </Wrapper>
  ) : (
    <LoaderWrapper>
      <WidgetLoader />
    </LoaderWrapper>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  ".gridImg": {
    display: "block",
    width: "157px",
    minHeight: "130px",
  },
  p: {
    cursor: "pointer",
  },
  ".MuiToggleButtonGroup-root": {
    display: "flex",
    gap: "16px",
    ".MuiToggleButton-root": {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      position: "relative",
      width: "fit-content",
      gap: "8px",
      padding: 0,
      textTransform: "unset !important",
      svg: {
        display: "none",
      },
      img: {
        outline: "1px solid transparent",
      },
    },
    ".Mui-selected": {
      backgroundColor: "transparent",
      svg: {
        display: "block",
        position: "absolute",
        right: "-5px",
        top: "-2px",
      },
      img: {
        outline: "1px solid #006BF6",
        borderRadius: "12px",
      },
      "&:hover": {
        backgroundColor: "transparent",
      },
    },
  },
  "@media(max-width: 1200px)": {
    ".gridImg": {
      maxWidth: "117px",
    },
  },
  "@media(max-width: 1020px)": {
    ".gridImg": {
      maxWidth: "90px",
    },
  },
}));

const LoaderWrapper = styled(Box)(() => ({
  width: "682px",
  height: "201px",
  maxWidth: "100%",
  maxHeight: "100%",
  position: "relative",

  "& > *": {
    background: "transparent !important",
    opacity: 1,
  },
}));

export default GridTemplate;
