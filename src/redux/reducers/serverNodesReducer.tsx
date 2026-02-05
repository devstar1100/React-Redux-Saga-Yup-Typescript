import { ServerNode } from "../../types/serverNode";
import { ValidationError } from "../../types/validationError";
import {
  UPDATE_ARE_SERVER_NODES_LOADING,
  UPDATE_SERVER_NODES,
  UPDATE_SERVER_NODE_VALIDATION_ERRORS,
} from "../actions/serverNodesActions";
import { StoreType } from "../types/store.types";

export interface serverNodesStateType {
  serverNodes: ServerNode[];
  validationErrors: ValidationError[];
  areLoading: boolean;
}

export const serverNodesInitialState: serverNodesStateType = {
  serverNodes: [],
  validationErrors: [],
  areLoading: false,
};

const serverNodesReducer = (state = serverNodesInitialState, action: any) => {
  switch (action.type) {
    case UPDATE_SERVER_NODES:
      return { ...state, serverNodes: action.payload };
    case UPDATE_SERVER_NODE_VALIDATION_ERRORS: {
      const payload = action.payload;
      const validationErrors = Array.isArray(payload) ? payload : [];

      return { ...state, validationErrors };
    }
    case UPDATE_ARE_SERVER_NODES_LOADING:
      return { ...state, areLoading: action.payload };
    default:
      return { ...state };
  }
};

export const getServerNodes = (state: StoreType) => state.serverNodes.serverNodes;
export const getServerNodeValidationErrors = (state: StoreType) => state.serverNodes.validationErrors;
export const getAreServerNodesLoading = (state: StoreType) => state.serverNodes.areLoading;

export default serverNodesReducer;
