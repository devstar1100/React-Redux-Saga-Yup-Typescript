import { useDispatch, useSelector } from "react-redux";

import { runSimulationSessionActionServer } from "../redux/actions/simulationActions";
import { getSessionInformation } from "../redux/reducers/simulationReducer";
import { SessionStatus, SimulationSessionActionType } from "../types/simulations";

const useSimulationRunMode = (simulationSessionId?: number) => {
  const dispatch = useDispatch();
  const session = useSelector(getSessionInformation);

  const setAsFastAsPossible = () => {
    if (simulationSessionId && session?.["simulation-session-status"] !== SessionStatus.uninitialized) {
      dispatch(
        runSimulationSessionActionServer({
          "simulation-session-id": simulationSessionId,
          "action-type": SimulationSessionActionType.setAsFastAsPossible,
        }),
      );
    }
  };

  const setRealTimeSpeed = () => {
    if (simulationSessionId && session?.["simulation-session-status"] !== SessionStatus.uninitialized) {
      dispatch(
        runSimulationSessionActionServer({
          "simulation-session-id": simulationSessionId,
          "action-type": SimulationSessionActionType.setRealTimeSpeed,
        }),
      );
    }
  };

  const setSpecificSpeed = (speed: number) => {
    if (simulationSessionId && session?.["simulation-session-status"] !== SessionStatus.uninitialized) {
      dispatch(
        runSimulationSessionActionServer({
          "simulation-session-id": simulationSessionId,
          "action-type": SimulationSessionActionType.setSpecificSpeed,
          "required-speed": speed,
        }),
      );
    }
  };

  return { setAsFastAsPossible, setRealTimeSpeed, setSpecificSpeed };
};

export default useSimulationRunMode;
