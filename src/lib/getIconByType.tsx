import { MapIconType } from "../types/customViews";

const formUrl = (commonUrl: string, isFramed: boolean): string => {
  if (!isFramed) return commonUrl;

  const [cutUrl] = commonUrl.split(".svg");
  return `${cutUrl}_framed.svg`;
};

export const getIconByType = (type: MapIconType, isFramed = false): string => {
  switch (type) {
    case MapIconType.aircraft:
      return formUrl(`/images/icons/plane.svg`, isFramed);
    case MapIconType.satellite:
      return formUrl("/images/icons/satellite.svg", isFramed);
    case MapIconType.car:
      return formUrl("/images/icons/car.svg", isFramed);
    case MapIconType.circle:
      return formUrl("/images/icons/circle.svg", isFramed);
    case MapIconType.box:
      return formUrl("/images/icons/box.svg", isFramed);
    default:
      return "";
  }
};
