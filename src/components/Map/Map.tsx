import { useState, useEffect, ReactElement, FC } from "react";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";
import { styled } from "@mui/material";
import { darkStyledMap } from "./MapStyles";
import CompassControll from "../Icons/ControlIcon";
import WidgetLoader from "../WidgetLoader/WidgetLoader";
import { DisplayElementMap } from "../../types/customViews";
import { getIconByType } from "../../lib/getIconByType";

interface Coord {
  lat: number;
  lng: number;
}

export interface MapMarker extends Coord {
  id: string;
  label: string;
}

interface Props {
  markers: MapMarker[];
  data: DisplayElementMap;
}

type LibrariesType = ("places" | "drawing" | "geometry" | "localContext" | "visualization")[];
const libraries: LibrariesType = ["places"];

const Map: FC<Props> = ({ markers, data }): ReactElement => {
  const [coords, setCoords] = useState({
    center: {
      lat: data["central-latitude"] || 0,
      lng: data["central-longitude"] || 0,
    },
    zoom: data["initial-zoom-level"] || 1,
  });

  useEffect(() => {
    if (!markers) return;
    setCoords((prev) => ({
      ...prev,
      center: {
        lat: markers.reduce((acc, curr) => acc + curr.lat, 0) / markers.length,
        lng: markers.reduce((acc, curr) => acc + curr.lng, 0) / markers.length,
      },
    }));
  }, [markers]);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY || "NO_KEY",
    libraries,
  });

  if (!isLoaded) return <WidgetLoader />;

  return (
    <Wrapper>
      <GoogleMap
        center={coords.center}
        zoom={coords.zoom}
        mapContainerStyle={{ width: "100%", height: "100%", background: "transparent" }}
        options={{
          styles: darkStyledMap,
          disableDefaultUI: true,
        }}
      >
        {markers?.map((marker: MapMarker) => (
          <Marker
            key={marker.id}
            position={{
              lat: marker.lat,
              lng: marker.lng,
            }}
            icon={{
              url: getIconByType(data["icon-type"], true),
              anchor: new window.google.maps.Point(marker.lat, marker.lng),
            }}
            label={{ text: marker.label, className: "mapMarkerLabel" }}
          />
        ))}
        <CustomControll>
          <CompassControll />
        </CustomControll>
      </GoogleMap>
    </Wrapper>
  );
};

const CustomControll = styled("div")({
  position: "absolute",
  right: 30,
  top: 30,
});

const Wrapper = styled("div")({
  width: "100%",
  height: "100%",

  "& > div > div": {
    backgroundColor: "transparent !important",
  },

  ".gm-style": {
    borderRadius: "8px",
    overflow: "hidden",
    background: "transparent",
  },

  ".mapMarkerLabel": {
    fontFamily: "Inter, sans-serif !important",
    color: "#ffffff !important",
    fontSize: "14px !important",
    lineHeight: "16px !important",
    fontWeight: "400 !important",
    fontStyle: "italic !important",
    position: "absolute !important",
    left: "0 !important",
    top: "-5px !important",
    transform: "translateX(-50%) !important",
  },
});

export default Map;
