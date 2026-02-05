import { FC } from "react";
import Container, { DisplayElementId } from "../WidgetContainer/WidgetContainer";
import PieChart from "../Chart/PieChart";
import { Grid, styled, Typography } from "@mui/material";
import GradientVerticalLine from "../Lines/GradientVertivalLine";
import { Fragment } from "react";
import { DisplayElementGauge, InternalLayoutType } from "../../types/customViews";

interface FormatedEngine {
  data: {
    name: string;
    value: number;
  };
  colors: {
    background: string;
    filledFrom: string;
    filledTo: string;
  };
  startDegree: number;
  text: number | string;
  units: string;
}

interface Props {
  engines: DisplayElementGauge[];
  title: string;
  layout: InternalLayoutType;
}

const engineColors = [
  { background: "#1e2811", filledFrom: "#ADEC34", filledTo: "#438C12" },
  { background: "#38141b", filledFrom: "#FF4861", filledTo: "#A90426" },
  { background: "#20130d", filledFrom: "#E5B23D", filledTo: "#EF5811" },
];

const engineDegrees = [0, 0, 0];

const EngineData: FC<Props & DisplayElementId> = ({ engines, title, layout, elementId }) => {
  const formatEngines = (engines: DisplayElementGauge[]): FormatedEngine[] => {
    const formatedEngines = engines.map((engine: DisplayElementGauge, index: number) => {
      const engineData = engine["model-parameter-data"][0];

      return {
        data: {
          name: engineData["parameter-name"],
          value:
            ((Number((engineData as any)["parameter-scale"] || 1) * Number(engineData["parameter-value"])) /
              engine["gauge-maximum-value"]) *
            100,
        },
        colors: engineColors[index],
        startDegree: engineDegrees[index],
        text:
          Math.round(
            (Number((engineData as any)["parameter-scale"] || 1) * Number(engineData["parameter-value"]) +
              Number.EPSILON) *
              10000,
          ) / 10000,
        units: engineData["parameter-units"],
      };
    });

    return formatedEngines;
  };

  const formatedEngines = formatEngines(engines);

  return (
    <Container title={title} elementId={elementId}>
      <Wrapper
        container
        flexDirection={layout === InternalLayoutType.vertical ? "column" : "row"}
        alignItems={layout === InternalLayoutType.vertical ? "center" : "stretch"}
      >
        {formatedEngines.map((chart, index) => (
          <Fragment key={index}>
            <Grid direction="column" alignItems="center" width="fit-content" container>
              <PieChart index={index} data={chart.data} colors={chart.colors} startDegree={chart.startDegree} />
              <Typography variant="h6" component="h5" color="textColor.light" marginTop="-15px">
                {chart.text + " " + chart.units}
              </Typography>
              <Typography variant="body2" component="h6" color="textColor.main">
                {chart.data.name}
              </Typography>
            </Grid>
            <GradientVerticalLine />
          </Fragment>
        ))}
      </Wrapper>
    </Container>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  justifyContent: "space-around",
  margin: "0 auto",
  "div:last-child.gradientVerticalLine": {
    display: "none",
  },
  [theme.breakpoints.down(1201)]: {
    justifyContent: "space-around",
    maxWidth: "530px",
  },
  [theme.breakpoints.up("xl")]: {
    maxWidth: "530px",
  },
}));

export default EngineData;
