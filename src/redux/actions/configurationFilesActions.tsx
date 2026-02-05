import { ConfigurationFile, ListUnitAction } from "../../types/configurationFile";
import { ValidationError } from "../../types/validationError";

export const UPDATE_CONFIGURATION_FILES = "UPDATE_CONFIGURATION_FILES";
export const UPDATE_CONFIG_FILE_VALIDATION_ERRORS = "UPDATE_CONFIG_FILE_VALIDATION_ERRORS";
export const UPDATE_CONFIGURATION_FILES_LOADING = "UPDATE_CONFIGURATION_FILES_LOADING";
export const GET_CONFIGURATION_FILES_SERVER = "GET_CONFIGURATION_FILES_SERVER";
export const ADD_CONFIGURATION_FILE_SERVER = "ADD_CONFIGURATION_FILE_SERVER";
export const EDIT_CONFIGURATION_FILE_SERVER = "EDIT_CONFIGURATION_FILE_SERVER";
export const DELETE_CONFIGURATION_FILE_SERVER = "DELETE_CONFIGURATION_FILE_SERVER";
export const DUPLICATE_CONFIGURATION_FILE_SERVER = "DUPLICATE_CONFIGURATION_FILE_SERVER";

export interface RedirectProps {
  redirect?: (subroute?: string) => void;
}
export interface GetConfigurationFilesServerProps {
  "simulation-user-config-id"?: number;
}

type AddConfigurationFileServerProps = Pick<
  ConfigurationFile,
  "simulation-id" | "default-initial-conditions-name" | "initial-conditions-overide-name"
> &
  Partial<
    Pick<
      ConfigurationFile,
      | "scenario-file-id"
      | "scenario-file-name"
      | "pod-identifier"
      | "pod-deployment-file-name"
      | "pod-deployment-namespace"
      | "containers-repository-path"
    >
  >;

type EditConfigurationFileServerProps = AddConfigurationFileServerProps &
  Pick<ConfigurationFile, "simulation-user-config-id">;

export const updateConfigurationFiles = (files: ConfigurationFile[]) => ({
  type: UPDATE_CONFIGURATION_FILES,
  payload: files,
});

export const updateConfigFileValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_CONFIG_FILE_VALIDATION_ERRORS,
  payload: errors,
});

export const updateConfigurationFilesLoading = (status: boolean) => ({
  type: UPDATE_CONFIGURATION_FILES_LOADING,
  payload: status,
});

export const getConfigurationFilesServer = (props: GetConfigurationFilesServerProps) => ({
  type: GET_CONFIGURATION_FILES_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-simulation-configurations`,
      params: { "simulation-user-config-id": props["simulation-user-config-id"] },
    },
  },
});

export const addConfigurationFileServer = (props: AddConfigurationFileServerProps & RedirectProps) => ({
  type: ADD_CONFIGURATION_FILE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-configuration/${0}/${ListUnitAction.add}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const editConfigurationFileServer = (props: EditConfigurationFileServerProps & RedirectProps) => ({
  type: EDIT_CONFIGURATION_FILE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-configuration/${props["simulation-user-config-id"]}/${ListUnitAction.edit}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const deleteConfigurationFileServer = (props: Required<GetConfigurationFilesServerProps>) => ({
  type: DELETE_CONFIGURATION_FILE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-configuration/${props["simulation-user-config-id"]}/${ListUnitAction.delete}`,
    },
  },
});

export const duplicateConfigurationFileServer = (props: Required<GetConfigurationFilesServerProps>) => ({
  type: DUPLICATE_CONFIGURATION_FILE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-configuration/${props["simulation-user-config-id"]}/${ListUnitAction.clone}`,
    },
  },
});
