import { CustomViewType, CustomViewGridTemplate, ManageCustomViewAction } from "../../types/customViews";
import { RedirectProps } from "./simulationActions";

export const GET_SIMULATION_CUSTOM_VIEWS_SERVER = "GET_SIMULATION_CUSTOM_VIEWS_SERVER";
export const GET_CUSTOM_VIEWS_LIST_SERVER = "GET_CUSTOM_VIEWS_LIST_SERVER";
export const ADD_CUSTOM_VIEW_SERVER = "ADD_CUSTOM_VIEW_SERVER";
export const EDIT_CUSTOM_VIEW_SERVER = "EDIT_CUSTOM_VIEW_SERVER";
export const DELETE_CUSTOM_VIEW_SERVER = "DELETE_CUSTOM_VIEW_SERVER";
export const CLONE_CUSTOM_VIEW_SERVER = "CLONE_CUSTOM_VIEW_SERVER";
export const GET_CUSTOM_VIEW_GRID_TEMPLATES_SERVER = "GET_CUSTOM_VIEW_GRID_TEMPLATES_SERVER";

export const UPDATE_SIMULATION_CUSTOM_VIEWS = "UPDATE_SIMULATION_CUSTOM_VIEWS";
export const UPDATE_CUSTOM_VIEWS_LIST = "UPDATE_CUSTOM_VIEWS_LIST";
export const UPDATE_CUSTOM_VIEW_GRID_TEMPLATES = "UPDATE_CUSTOM_VIEW_GRID_TEMPLATES";
export const UPDATE_ARE_GRID_TEMPLATES_LOADING = "UPDATE_ARE_GRID_TEMPLATES_LOADING";

interface AddCustomViewServerProps {
  "simulation-id": number;
  "custom-view-caption": string;
  "custom-view-menu-index": number;
  "custom-view-grid-template-id": number;
  "is-custom-view-active": boolean;
}

type EditCustomViewServerProps = AddCustomViewServerProps & {
  "custom-view-id": number;
};

export interface DeleteCustomViewServerProps {
  "simulation-id": number;
  "custom-view-id": number;
}

export const getSimulationCustomViewsServer = (simulationId: number) => ({
  type: GET_SIMULATION_CUSTOM_VIEWS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/custom-views/${simulationId}`,
    },
  },
});

export const getCustomViewsListServer = () => ({
  type: GET_CUSTOM_VIEWS_LIST_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/custom-views/${0}`,
    },
  },
});

export const getCustomViewGridTemplatesServer = () => ({
  type: GET_CUSTOM_VIEW_GRID_TEMPLATES_SERVER,
  payload: {
    request: {
      method: "GET",
      url: "/custom-view-grid-templates",
    },
  },
});

export const addCustomViewServer = (props: AddCustomViewServerProps & RedirectProps) => ({
  type: ADD_CUSTOM_VIEW_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-custom-views/${props["simulation-id"]}/${ManageCustomViewAction.add}`,
      params: {
        "custom-view-caption": props["custom-view-caption"],
        "custom-view-menu-index": props["custom-view-menu-index"],
        "custom-view-grid-template-id": props["custom-view-grid-template-id"],
        "is-custom-view-active": props["is-custom-view-active"],
      },
    },
    redirect: props.redirect,
  },
});

export const editCustomViewServer = (props: EditCustomViewServerProps & RedirectProps) => ({
  type: EDIT_CUSTOM_VIEW_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-custom-views/${props["simulation-id"]}/${ManageCustomViewAction.edit}`,
      params: {
        "custom-view-id": props["custom-view-id"],
        "custom-view-caption": props["custom-view-caption"],
        "custom-view-menu-index": props["custom-view-menu-index"],
        "custom-view-grid-template-id": props["custom-view-grid-template-id"],
        "is-custom-view-active": props["is-custom-view-active"],
      },
    },
    redirect: props.redirect,
  },
});

export const deleteCustomViewServer = (props: DeleteCustomViewServerProps) => ({
  type: DELETE_CUSTOM_VIEW_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-custom-views/${props["simulation-id"]}/${ManageCustomViewAction.delete}`,
      params: {
        "custom-view-id": props["custom-view-id"],
        "simulation-id": props["simulation-id"],
      },
    },
  },
});

export const cloneCustomViewServer = (props: DeleteCustomViewServerProps) => ({
  type: CLONE_CUSTOM_VIEW_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-custom-views/${props["simulation-id"]}/${ManageCustomViewAction.clone}`,
      params: {
        "custom-view-id": props["custom-view-id"],
      },
    },
  },
});

export const updateSimulationCustomViews = (customViews: CustomViewType[]) => ({
  type: UPDATE_SIMULATION_CUSTOM_VIEWS,
  payload: customViews,
});

export const updateCustomViewsList = (customViews: CustomViewType[]) => ({
  type: UPDATE_CUSTOM_VIEWS_LIST,
  payload: customViews,
});

export const updateCustomViewGridTemplates = (gridTemplates: CustomViewGridTemplate[]) => ({
  type: UPDATE_CUSTOM_VIEW_GRID_TEMPLATES,
  payload: gridTemplates,
});

export const updateAreGridTemplatesLoading = (status: boolean) => ({
  type: UPDATE_ARE_GRID_TEMPLATES_LOADING,
  payload: status,
});
