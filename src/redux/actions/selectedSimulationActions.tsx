export const UPDATE_SELECTED_SIMULATION_NAME = "UPDATE_SELECTED_SIMULATION_NAME";

export const updateSelectedSimulationName = (simulationName: string) => ({
  type: UPDATE_SELECTED_SIMULATION_NAME,
  payload: simulationName,
});
