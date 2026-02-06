export interface MonteCarloBatch {
  "batch-id": number;
  "simulation-name": string;
  "user-id": number;
  "simulation-id": number;
  "run-prefix": string;
  "input-output-parameters-file-name": string;
  "number-of-planned-runs": number;
  "number-of-active-runs": number;
  "number-of-finished-runs": number;
  "number-of-successfull-runs": number;
  "last-run-index": number;
  "master-seed": number;
  "max-execution-time-sec": number;
  sleep_seconds_between_runs: number;
  "execution-speed": number;
  "current-state": string;
  "result-file-name": string;
  "result-file-path": string;
  "simulation-sessions-list-last-n": MonteCarloSession[];
}

export interface MonteCarloSession {
  "batch-id": number;
  "session-id": number;
  "run-index": number;

  "run-start-time": string; // ISO 8601 datetime
  "run-last-update-time": string; // ISO 8601 datetime

  "current-state": string;
}
