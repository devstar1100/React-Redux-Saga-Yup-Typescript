import { ButtonActionType, CustomViewType } from "../../types/customViews";

export const GET_CUSTOM_VIEW_DATA_SERVER = "GET_CUSTOM_VIEW_DATA_SERVER";
export const HANDLE_BUTTON_ACTION_SERVER = "HANDLE_BUTTON_ACTION_SERVER";
export const REFRESH_CUSTOM_VIEW_DATA_SERVER = "REFRESH_CUSTOM_VIEW_DATA_SERVER";
export const UPDATE_CUSTOM_VIEW_LAYOUT_SERVER = "UPDATE_CUSTOM_VIEW_LAYOUT_SERVER";

export const UPDATE_CUSTOM_VIEW_DATA = "UPDATE_CUSTOM_VIEW_DATA";
export const UPDATE_IS_CUSTOM_VIEW_LOADING = "UPDATE_IS_CUSTOM_VIEW_LOADING";
export const UPDATE_IS_CUSTOM_VIEW_EDIT_MODE = "UPDATE_IS_CUSTOM_VIEW_EDIT_MODE";
export const DUPLICATE_DISPLAY_ELEMENT = "DUPLICATE_DISPLAY_ELEMENT";
export const DELETE_DISPLAY_ELEMENT = "DELETE_DISPLAY_ELEMENT";

interface GetCustomViewDataServerProps {
  "simulation-session-id": number;
  "custom-view-id": number;
}

interface UpdateCustomViewServerProps {
  "simulation-id": number;
  "custom-view-id": number;
  nextData: CustomViewType;
}

type HandleButtonActionServerProps = GetCustomViewDataServerProps & {
  "button-id": number;
  "button-action": ButtonActionType;
  "event-enum": number;
  "action-key": string;
  "event-target-model": string;
  "scenario-file-name": string;
};

export const getCustomViewDataServer = (props: GetCustomViewDataServerProps) => ({
  type: GET_CUSTOM_VIEW_DATA_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/custom-view/${props["simulation-session-id"]}/${props["custom-view-id"]}`,
    },
  },
});

export const handleButtonActionServer = (props: HandleButtonActionServerProps) => ({
  type: HANDLE_BUTTON_ACTION_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/handle-button-action/${props["simulation-session-id"]}/${props["custom-view-id"]}/${props["button-id"]}/${props["button-action"]}`,
      params: {
        "event-enum": props["event-enum"],
        "action-key": props["action-key"],
        "event-target-model": props["event-target-model"],
        "scenario-file-name": props["scenario-file-name"],
      },
    },
  },
});

export const refreshCustomViewDataServer = (props: GetCustomViewDataServerProps) => ({
  type: REFRESH_CUSTOM_VIEW_DATA_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/refresh-custom-view-data/${props["simulation-session-id"]}/${props["custom-view-id"]}`,
    },
  },
});

export const updateCustomViewLayoutServer = (props: UpdateCustomViewServerProps) => ({
  type: UPDATE_CUSTOM_VIEW_LAYOUT_SERVER,
  payload: {
    request: {
      method: "POST",
      url: `/update-custom-view-layout/${props["simulation-id"]}/${props["custom-view-id"]}`,
      data: [props.nextData],
    },
  },
});

export const updateCustomViewData = (data: CustomViewType) => ({
  type: UPDATE_CUSTOM_VIEW_DATA,
  payload: data,
});

export const updateIsCustomViewLoading = (isLoading: boolean) => ({
  type: UPDATE_IS_CUSTOM_VIEW_LOADING,
  payload: isLoading,
});

export const updateIsCustomViewEditMode = (isEditMode: boolean) => ({
  type: UPDATE_IS_CUSTOM_VIEW_EDIT_MODE,
  payload: isEditMode,
});

export const duplicateDisplayElement = (id: number) => ({
  type: DUPLICATE_DISPLAY_ELEMENT,
  payload: id,
});

export const deleteDisplayElement = (id: number) => ({
  type: DELETE_DISPLAY_ELEMENT,
  payload: id,
});
