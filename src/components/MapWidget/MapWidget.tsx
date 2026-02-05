import { FC, ReactElement } from "react";
import Map from "../Map/Map";
import Container, { DisplayElementId } from "../WidgetContainer/WidgetContainer";
import React, { useMemo } from "react";
import { Box, styled } from "@mui/material";
import { DisplayElementMap } from "../../types/customViews";

interface Props {
  mapData: DisplayElementMap[];
  title: string;
}

const MapPosition: FC<Props & DisplayElementId> = ({ mapData, elementId, title }): ReactElement => {
  const markers = useMemo(
    () =>
      mapData[0]["latitude-data-points-degrees"].map((coord: any, index: number) => ({
        lat: coord["parameter-value"],
        lng: Number(mapData[0]["longitude-data-points-degrees"][index]["parameter-value"]),
        id: `${coord["parameter-path"]}_${mapData[0]["longitude-data-points-degrees"][index]["parameter-path"]}`,
        label: mapData[0]["data-point-captions"][index],
      })),
    [mapData],
  );

  return (
    <Box sx={{ height: "100%", "& > *": { height: "100%" } }}>
      <Container className="name6 mapContainer" title={title} elementId={elementId}>
        <MapWrapper>
          <Map markers={markers} data={mapData[0]} />
        </MapWrapper>
      </Container>
    </Box>
  );
};

const MapWrapper = styled("div")(({ theme }) => ({
  height: "100%",
  width: "100%",
  paddingTop: "16px",
}));

export default MapPosition;
