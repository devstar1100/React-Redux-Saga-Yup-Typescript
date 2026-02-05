import { ManageSimulationAction, Simulation, SimulationEnumType } from "../../types/simulations";

export const GET_SIMULATIONS_SERVER = "GET_SIMULATIONS_SERVER";
export const GET_SIMULATIONS_EXTENDED_INFO_SERVER = "GET_SIMULATIONS_EXTENDED_INFO_SERVER";
export const GET_ENUMERATORS_SERVER = "GET_ENUMERATORS_SERVER";
export const GET_SPECIFIC_ENUMERATOR_SERVER = "GET_SPECIFIC_ENUMERATOR_SERVER";

export const UPDATE_SIMULATIONS = "UPDATE_SIMULATIONS";
export const UPDATE_ENUMERATORS = "UPDATE_ENUMERATORS";
export const UPDATE_SPECIFIC_ENUMERATOR = "UPDATE_SPECIFIC_ENUMERATOR";
export const UPDATE_ARE_SIMULATIONS_LOADING = "UPDATE_ARE_SIMULATIONS_LOADING";

export const MANAGE_SIMULATIONS_SERVER = "MANAGE_SIMULATIONS_SERVER";

interface GetSimulationsServerProps {
  name?: string;
}

interface GetSimulationsExtendedInfoServerProps {
  name?: string;
  "simulation-id"?: number;
  "user-id"?: number;
}
interface ManageSimulationsServerProps {
  "simulation-id": number;
  "action-type": ManageSimulationAction;
}

interface GetSpecificEnumeratorServerProps {
  "enum-type": string;
}

export const updateSimulations = (simulations: Simulation[]) => ({
  type: UPDATE_SIMULATIONS,
  payload: simulations,
});

export const updateAreSimulationsLoading = (areLoading: boolean) => ({
  type: UPDATE_ARE_SIMULATIONS_LOADING,
  payload: areLoading,
});

export const updateEnumerators = (enumerators: SimulationEnumType[]) => ({
  type: UPDATE_ENUMERATORS,
  payload: enumerators,
});

export const updateSpecificEnumerator = (enumerator: SimulationEnumType) => ({
  type: UPDATE_SPECIFIC_ENUMERATOR,
  payload: enumerator,
});

export const getSimulationsServer = (props: GetSimulationsServerProps) => ({
  type: GET_SIMULATIONS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/simulations`,
      params: { name: props.name },
    },
  },
});

export const getSimulationsExtendedInfoServer = (props: GetSimulationsExtendedInfoServerProps) => ({
  type: GET_SIMULATIONS_EXTENDED_INFO_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/list-simulations`,
      params: { ...props },
    },
  },
});

export const getEnumeratorsServer = () => ({
  type: GET_ENUMERATORS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/enumerators`,
    },
  },
});

export const getSpecificEnumeratorServer = (props: GetSpecificEnumeratorServerProps) => ({
  type: GET_SPECIFIC_ENUMERATOR_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/enumerators`,
      params: { "enum-type": props["enum-type"] },
    },
  },
});

export const manageSimulationsServer = (props: ManageSimulationsServerProps) => ({
  type: MANAGE_SIMULATIONS_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/manage-simulation/${props["simulation-id"]}/${props["action-type"]}`,
    },
  },
});
