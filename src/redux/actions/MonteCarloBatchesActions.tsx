import { MonteCarloBatch } from "../../types/monteCarloBatches";

export const GET_MONTECARLOBATCHESLIST_SERVER = "GET_MONTECARLOBATCHESLIST_SERVER";
export const UPDATE_ARE_MONTECARLOBATCHESLIST_LOADING = "UPDATE_ARE_MONTECARLOBATCHESLIST__LOADING";
export const UPDATE_MONTECARLOBATCHES = "UPDATE_MONTECARLOBATCHES";

export const getMonteCarloBatchesListServer = () => ({
  type: GET_MONTECARLOBATCHESLIST_SERVER,
  payload: {
    request: {
      method: "GET",
      url: `/monte-carlo-batch-list`,
    },
  },
});

export const updateAreMonteCarloBatchesListLoading = (areLoading: boolean) => ({
  type: UPDATE_ARE_MONTECARLOBATCHESLIST_LOADING,
  payload: areLoading,
});

export const updateMonteCarloBatchesList = (MonteCarloBatches: MonteCarloBatch[]) => ({
  type: UPDATE_MONTECARLOBATCHES,
  payload: MonteCarloBatches,
});
