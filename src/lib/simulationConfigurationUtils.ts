interface GetScenarioFilesFullLinkParams {
  baseRoute: string;
  simulationId?: number;
  sessionId?: number;
}

export const getSimDependantPageFullLink = ({ baseRoute, simulationId, sessionId }: GetScenarioFilesFullLinkParams) => {
  if (simulationId && sessionId) return `${baseRoute}/${simulationId}/${sessionId}`;

  if (simulationId) return `${baseRoute}/${simulationId}`;

  return `${baseRoute}`;
};
