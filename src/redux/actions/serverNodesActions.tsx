import { ListUnitAction } from "../../types/configurationFile";
import { ServerNode } from "../../types/serverNode";
import { ValidationError } from "../../types/validationError";

export const GET_SERVER_NODES_SERVER = "GET_SERVER_NODES_SERVER";
export const ADD_SERVER_NODE_SERVER = "ADD_SERVER_NODE_SERVER";
export const EDIT_SERVER_NODE_SERVER = "EDIT_SERVER_NODE_SERVER";
export const DELETE_SERVER_NODE_SERVER = "DELETE_SERVER_NODE_SERVER";

export const UPDATE_SERVER_NODES = "UPDATE_SERVER_NODES";
export const UPDATE_SERVER_NODE_VALIDATION_ERRORS = "UPDATE_SERVER_NODE_VALIDATION_ERRORS";
export const UPDATE_ARE_SERVER_NODES_LOADING = "UPDATE_ARE_SERVER_NODES_LOADING";

export const DUPLICATE_SERVER_NODE_SERVER = "DUPLICATE_SERVER_NODE_SERVER";

export interface RedirectProps {
  redirect?: (subroute?: string) => void;
}

export interface GetServerNodesServerProps {
  "simulation-server-node-id"?: number;
}

type AddServerNodeServerProps = Pick<
  ServerNode,
  "simulation-id" | "simulation-server-node-name" | "server-agent-ip-address" | "api-server-ip-address"
> &
  Partial<Pick<ServerNode, "simulation-run-mode-id" | "server-agent-listening-port-number" | "api-server-port-number">>;

type EditServerNodeServerProps = AddServerNodeServerProps & Pick<ServerNode, "simulation-server-node-id">;

export const updateServerNodes = (serverNodes: ServerNode[]) => ({
  type: UPDATE_SERVER_NODES,
  payload: serverNodes,
});

export const updateServerNodeValidationErrors = (errors: ValidationError[]) => ({
  type: UPDATE_SERVER_NODE_VALIDATION_ERRORS,
  payload: errors,
});

export const updateAreServerNodesLoading = (areLoading: boolean) => ({
  type: UPDATE_ARE_SERVER_NODES_LOADING,
  payload: areLoading,
});

export const getServerNodesServer = (props: GetServerNodesServerProps) => ({
  type: GET_SERVER_NODES_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-simulation-server-nodes`,
      params: { ...props },
    },
  },
});

export const addServerNodeServer = (props: AddServerNodeServerProps & RedirectProps) => ({
  type: ADD_SERVER_NODE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-server-node/${0}/${ListUnitAction.add}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const editServerNodeServer = (props: EditServerNodeServerProps & RedirectProps) => ({
  type: EDIT_SERVER_NODE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-server-node/${props["simulation-server-node-id"]}/${ListUnitAction.edit}`,
      params: { ...props },
    },
    redirect: props.redirect,
  },
});

export const deleteServerNodeServer = (props: Required<GetServerNodesServerProps>) => ({
  type: DELETE_SERVER_NODE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-server-node/${props["simulation-server-node-id"]}/${ListUnitAction.delete}`,
    },
  },
});

export const duplicateServerNodeServer = (props: Required<GetServerNodesServerProps>) => ({
  type: DUPLICATE_SERVER_NODE_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation-server-node/${props["simulation-server-node-id"]}/${ListUnitAction.clone}`,
    },
  },
});
