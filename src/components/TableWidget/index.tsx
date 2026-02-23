import { Box, styled } from "@mui/material";
import { useDispatch } from "react-redux";

import Container, { DisplayElementId } from "../WidgetContainer";
import DataTable from "../Tables/DataTable";
import { DisplayElementCaption, DisplayElementTable, ModelParameter } from "../../types/customViews";
import BrushIcon from "../Icons/BrushIcon";
import { Popups } from "../../types/popups";
import { updatePopup } from "../../redux/actions/popupsActions";
import { ModifyParamPopupProps } from "../Popups/ModifyParameterPopup";
import { Session } from "../../types/simulations";

const Table = (
  props: DisplayElementTable & DisplayElementCaption & DisplayElementId & Pick<Session, "simulation-session-id">,
) => {
  const dispatch = useDispatch();

  const handleEditClick = (data: ModelParameter) => {
    dispatch(
      updatePopup({
        popup: Popups.modifyParameter,
        status: true,
        prefilled: {
          "simulation-session-id": props["simulation-session-id"],
          "parameter-path": data["parameter-path"],
        } as ModifyParamPopupProps,
      }),
    );
  };

  const formatParameterValue = (value: number | "", scale: string) => {
    if (value === "") return "";

    const numericalValue = Number(value);

    if (Number.isNaN(numericalValue)) return value;

    return Number.isFinite(numericalValue)
      ? Math.round((numericalValue * Number(scale || 1) + Number.EPSILON) * 10000) / 10000
      : numericalValue;
  };

  const mappedData = props["model-parameters"]?.map((param) => ({
    id: `${props["display-element-caption"]}-${param["parameter-order"]}`,
    cells: [
      param["parameter-name"],
      formatParameterValue(param["parameter-value"], (param as any)["parameter-scale"]),
      param["parameter-units"],
      <IconWrapper key="edit-param-button" onClick={(e: any) => (e.stopPropagation(), handleEditClick(param))}>
        <BrushIcon />
      </IconWrapper>,
    ],
  }));

  return (
    <Container title={props["display-element-caption"]} elementId={props.elementId}>
      <DataTable data={mappedData} />
    </Container>
  );
};

const IconWrapper = styled(Box)({
  opacity: 0,
  visibility: "hidden",
  transition: "opacity 0.3s, visibility 0.3s",
  cursor: "pointer",

  "& > svg": { width: "16px", height: "16px" },
});

export default Table;
