import { Popups } from "../../types/popups";
import { UPDATE_POPUP } from "../actions/popupsActions";
import { StoreType } from "../types/store.types";

export interface PopupsStateType {
  [Popups.confirmation]: boolean;
  [Popups.addTable]: boolean;
  [Popups.addGauge]: boolean;
  [Popups.addButton]: boolean;
  [Popups.addMap]: boolean;
  [Popups.addChart]: boolean;
  [Popups.modifyParameter]: boolean;
  prefilled: unknown;
}

export const popupsInitialState: PopupsStateType = {
  [Popups.confirmation]: false,
  [Popups.addTable]: false,
  [Popups.addGauge]: false,
  [Popups.addButton]: false,
  [Popups.addMap]: false,
  [Popups.addChart]: false,
  [Popups.modifyParameter]: false,
  prefilled: null,
};

const popupsReducer = (state = popupsInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_POPUP: {
      const { popup, status, prefilled } = action.payload;
      return { ...state, [popup]: status, prefilled: { ...(state.prefilled || {}), ...prefilled } };
    }
    default:
      return { ...state };
  }
};

export const getConfirmationPopupState = (state: StoreType) => state.popups[Popups.confirmation];
export const getAddTablePopupState = (state: StoreType) => state.popups[Popups.addTable];
export const getAddGaugePopupState = (state: StoreType) => state.popups[Popups.addGauge];
export const getAddButtonPopupState = (state: StoreType) => state.popups[Popups.addButton];
export const getAddMapPopupState = (state: StoreType) => state.popups[Popups.addMap];
export const getAddChartPopupState = (state: StoreType) => state.popups[Popups.addChart];
export const getModifyParameterPopupState = (state: StoreType) => state.popups[Popups.modifyParameter];
export const getPopupPrefilledInfo = (state: StoreType) => state.popups.prefilled;

export default popupsReducer;
