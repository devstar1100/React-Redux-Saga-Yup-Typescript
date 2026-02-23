import { Grid, styled, Typography } from "@mui/material";
import { FC, ReactElement, ReactNode, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";

import HorizontalGrayLine from "../Lines/HorizontalGrayLine";
import FillLayout from "../../layouts/FillLayout";
import ThreeDotsIcon from "../Icons/ThreeDotsIcon";
import InfoModal from "../Modals/InfoModal";
import { getCurrentCustomView, getIsCustomViewEditMode } from "../../redux/reducers/customViewReducer";
import { ActionsList } from "../../types/actions";
import BrushIcon from "../Icons/BrushIcon";
import DuplicateIcon from "../Icons/DuplicateIcon";
import TrashIcon from "../Icons/TrashIcon";
import ActionsModal from "../Modals/ActionsModal";
import { pages } from "../../lib/routeUtils";
import { deleteDisplayElement, duplicateDisplayElement } from "../../redux/actions/customViewActions";
import { updatePopup } from "../../redux/actions/popupsActions";
import { Popups } from "../../types/popups";
import { ConfirmationPopupProps } from "../Popups/ConfirmationPopup";
import { getCurrentRoute } from "../../lib/getCurrentRoute";
import { AddWidgetPrefilledProps } from "../../types/addWidgetPopupProps";
import { getCurrentSimulation } from "../../redux/reducers/simulationReducer";
import { CustomViewType, CustomViewTableCell, DisplayElement, DisplayElementType } from "../../types/customViews";

export interface DisplayElementId {
  elementId?: number;
}

interface IContainer {
  title?: string;
  headingAction?: ReactElement | ReactElement[];
  children?: ReactNode | ReactNode[];
  className?: string;
  breadcrumbs?: ReactElement | ReactElement[];
  bottomActionBlock?: ReactElement | ReactElement[];
  disableOverlay?: boolean;
}

const mapElementTypeToPopupType = {
  [DisplayElementType.table]: Popups.addTable,
  [DisplayElementType.gauges]: Popups.addGauge,
  [DisplayElementType.chart]: Popups.addChart,
  [DisplayElementType.map]: Popups.addMap,
  [DisplayElementType.buttons]: Popups.addButton,
  [DisplayElementType.simulationControlWidget]: null,
  [DisplayElementType.simulationLogWidget]: null,
  [DisplayElementType.staticText]: null,
  [DisplayElementType.dataValues]: null,
};

const Container: FC<IContainer & DisplayElementId> = ({
  title,
  headingAction,
  children,
  className,
  elementId,
  breadcrumbs,
  bottomActionBlock,
  disableOverlay = false,
}): ReactElement => {
  const dispatch = useDispatch();

  const { pathname } = useLocation();
  const { sessionId, customViewId } = useParams();

  const isCustomViewEditMode = useSelector(getIsCustomViewEditMode);
  const simulation = useSelector(getCurrentSimulation);
  const currentView = useSelector(getCurrentCustomView);

  const [isContextMenuActive, setIsContextMenuActive] = useState<boolean>(false);

  const currentRoute = getCurrentRoute(pathname);

  const handleWidgetEdit = () => {
    const currentCell = (currentView as CustomViewType)["view-table-cells"].find((cell) =>
      cell["display-section-elements"].some((el) => el["display-element-id"] === elementId),
    ) as CustomViewTableCell;
    const targetWidgetIdx = currentCell["display-section-elements"].findIndex(
      (el) => el["display-element-id"] === elementId,
    );
    const targetWidget = currentCell["display-section-elements"][targetWidgetIdx] as DisplayElement;
    const popupType = mapElementTypeToPopupType[targetWidget["display-element-type"] as DisplayElementType];

    if (popupType)
      dispatch(
        updatePopup({
          popup: popupType as Popups,
          status: true,
          prefilled: {
            simulationId: Number(simulation?.["simulation-id"]),
            sessionId: Number(sessionId),
            customViewId: Number(customViewId),
            targetRowIdx: currentCell["custom-view-cell-row-index"],
            targetColIdx: currentCell["custom-view-cell-column-index"],
            order: targetWidgetIdx,
            isEditMode: true,
          } as AddWidgetPrefilledProps,
        }),
      );
    else alert("Editing is not supported for this type of widget!");
  };

  const actionsList: ActionsList = [
    {
      icon: <BrushIcon />,
      title: "Edit",
      handlerFunc: handleWidgetEdit,
    },
    {
      icon: <DuplicateIcon />,
      title: "Duplicate",
      handlerFunc: () => elementId && dispatch(duplicateDisplayElement(elementId)),
    },
    {
      icon: <TrashIcon />,
      title: "Delete",
      handlerFunc: () => {
        if (elementId) {
          const prefilled: ConfirmationPopupProps = {
            title: "Delete element",
            message: "Are you sure you want to delete this display element?",
            confirmBtnText: "Delete",
            declineBtnText: "Cancel",
            confirmBtnColor: "red",
            onConfirm: () => elementId && dispatch(deleteDisplayElement(elementId)),
            onDecline: () => dispatch(updatePopup({ popup: Popups.confirmation, status: false })),
          };

          dispatch(updatePopup({ popup: Popups.confirmation, status: true, prefilled }));
        }
      },
    },
  ];

  const handleDotsClick = () => setIsContextMenuActive(true);

  const handleContextMenuClose = () => setIsContextMenuActive(false);

  return (
    <FillLayout>
      <>
        <Grid height="fit-content" container direction="column" className={className}>
          <Heading container justifyContent="space-between" alignItems="center" gap="10px" className="customHeading">
            {title && (
              <Typography component="h6" variant="h6" color="textColor.lightWhite">
                {title}
              </Typography>
            )}
            {breadcrumbs}
            <ActionWrapper container width="fit-content" justifyContent="space-between" alignItems="center" gap="12px">
              {headingAction}
            </ActionWrapper>
            {currentRoute === pages.customView() && !disableOverlay && (
              <ActionWrapper width="fit-content" position="relative">
                <ActionWrapper minWidth="18px" onClick={handleDotsClick}>
                  <ThreeDotsIcon />
                </ActionWrapper>
                <ModalWrapper>
                  {isCustomViewEditMode ? (
                    <ActionsModal
                      actionsList={actionsList}
                      isActive={isContextMenuActive}
                      onClose={handleContextMenuClose}
                    />
                  ) : (
                    <InfoModal
                      title="Edit Element"
                      description={`You need to first click on "Go to Edit mode" button`}
                      isActive={isContextMenuActive}
                      onClose={handleContextMenuClose}
                    />
                  )}
                </ModalWrapper>
              </ActionWrapper>
            )}
          </Heading>
          {children && (
            <>
              <HorizontalGrayLine />
              <Wrapper className="customContent">
                {children}{" "}
                {currentRoute === pages.customView() && isCustomViewEditMode && !disableOverlay && <Overlay />}
              </Wrapper>
              {bottomActionBlock}
            </>
          )}
        </Grid>
      </>
    </FillLayout>
  );
};

const Wrapper = styled(Grid)(({ theme }) => ({
  padding: "0 24px 16px",
  position: "relative",
  width: "100%",
  flex: 1,
  [theme.breakpoints.down("lg")]: {
    padding: "0 16px 16px",
  },
}));

const Heading = styled(Grid)(({ theme }) => ({
  padding: "18px 24px",
  [theme.breakpoints.down("lg")]: {
    padding: "12px 16px",
  },
}));

const ActionWrapper = styled(Grid)(() => ({
  display: "flex",
  alignItems: "center",
  svg: {
    cursor: "pointer",
  },
}));

const ModalWrapper = styled(Grid)(() => ({
  position: "absolute",
  top: 0,
  right: "calc(100% + 6px)",
}));

const Overlay = styled("div")(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.3)",
}));

export default Container;
