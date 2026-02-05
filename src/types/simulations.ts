export interface Simulation {
  "simulation-id": number;
  "simulation-name": string;
  "project-id": string;
  "project-name": string;
  "simulation-owner-id": string;
  "simulation-owner-name": string;
  "master-simulation-name": string;
  "creation-date": string;
  "default-scenario-name": string;
  "scenario-file-name": string;
  "last-execution-date": string;
  "last-update-date": string;
  "simulation-status-id": string;
  "simulation-status": SimulationStatus;
  "default-session-information": Session;
  "default-time-information": TimeInformation;
  "active-simulation-sessions": Session[];
  "simulation-executable-path": string;
  "simulation-base-folder-path": string;
  "simulation-user-config-id": number;
  "simulation-server-node-id": number;
  "simulation-server-node-name": string;
  "server-agent-ip-address": string;
  "server-agent-listening-port-number": string;
  "configuration-name": string;
  "user-config-file-name": string;
  "default-initial-conditions-name": string;
  "initial-conditions-overide-name": string;
  "api-server-ip-address": string;
  "api-server-port-number": string;
  "wait-for-go-when-launching": boolean;
  "develop-simulation-output-folder-path": string;
  "simulation-executable-exists": boolean;
}

export interface Session {
  "simulation-id": number;
  "simulation-name": string;
  "simulation-session-owner": string;
  "initial-conditions-name": string;
  "simulation-controller-address": string;
  "scenario-name": string;
  "simulation-session-id": number;
  "process-id": number;
  "simulation-execution-speed": number;
  "number-of-systems": number;
  "number-of-models": number;
  "number-of-processes": number;
  "total-concurrent-simulation-sessions": number;
  "user-license-usage-info": string;
  "total-license-usage-info": string;
  "simulation-session-status": SessionStatus;
  "simulation-run-mode": SimulationRunMode;
  "creation-date": string;
  "simulation-session-details": string;
}

export enum SessionStatus {
  uninitialized = "Uninitialized",
  initializing = "Initializing",
  initialized = "Initialized",
  running = "Running",
  paused = "Paused",
  terminated = "Terminated",
  failedToLaunch = "Failed to launch",
  crashed = "Crashed",
}

export enum SimulationRunMode {
  asFastAsPossible = "as-fast-as-possible",
  realTime = "real-time",
  specificSpeed = "specific-speed",
}

export interface TimeInformation {
  "simulation-session-id": number;
  "simulation-initial-utc-time": string;
  "simulation-current-utc-time": string;
  "simulation-elapsed-time-seconds": number;
  "simulation-tick-number": number;
  "maximum-tick-frequency-hz": number;
  "simulation-execution-speed": number;
  "simulation-run-mode": SimulationRunMode;
  "session-manager-connection-status": string;
  "session-manager-status": string;
  "number-of-rest-server-errors": number;
  "number-of-session-manager-errors": number;
  "rest-api-server-up-time-seconds": number;
  "session-manager-number-of-connected-rest-servers": number;
  "session-manager-up-time-seconds": number;
  "rest-server-listening-port-for-simulations": number;
  "number-of-running-simulations": number;
  "number-of-cached-users": number;
  "number-of-cached-simulations": number;
  "session-manager-version-number": string;
  "rest-api-server-version-number": string;
  "rest-server-interface-version": number;
  "session-manager-interface-version": number;
}

export enum SimulationActionType {
  select = "select-simulation",
  unselect = "unselect-simulation",
  delete = "delete-simulation",
  changeStatus = "change-simulation-status",
}

export enum SimulationSessionActionType {
  initialize = "initialize",
  run = "run",
  step = "step",
  pause = "pause",
  terminate = "terminate",
  abort = "abort",
  queryStatus = "query-status",
  attach = "attach",
  detach = "detach",
  setRealTimeSpeed = "set-real-time-speed",
  setAsFastAsPossible = "set-as-fast-as-possible",
  setSpecificSpeed = "set-specific-speed",
}

export enum SimulationStatus {
  incomplete = "incomplete",
  inDevelopment = "in-developement",
  inProduction = "in-production",
  allowToDelete = "allow-to-delete",
  codeGenerated = "code-generated",
  executableBuilding = "executable-building",
  executableBuilt = "executable-built",
}

export interface SimulationDataHyrarchy {
  "total-number-of-systems": number;
  "refresh-interval-seconds"?: number;
  "simulation-session-data": Session;
  "simulation-time-data": TimeInformation;
  "simulation-systems": System[];
  "simulation-server-nodes": ServerNode[];
  "custom-simulation-data": ModelDataItem[];
  "system-types": SystemType[];
  "model-types": ModelType[];
}

export interface SystemType {
  "system-type-id": number;
  "system-type-name": string;
  "system-quantity": number;
}

export interface ModelType {
  "model-type-id": number;
  "model-type-name": string;
  "model-quantity": number;
}

export interface LogRecordsData {
  "total-number-of-log-records": number;
  "total-number-of-warnings": number;
  "total-number-of-errors": number;
  "total-number-of-fatals": number;
  "log-records": LogRecord[];
}

export interface LogRecord {
  "log-record-index": number;
  "log-record-simulation-elapsed-time-seconds": number;
  "log-severity-level": LogSeverityLevel;
  "log-message": string;
}

export enum LogSeverityLevel {
  unconditional = "unconditional",
  fatal = "fatal",
  error = "error",
  warning = "warning",
  info = "info",
  debug = "debug",
  sdsDebug = "sds-debug",
}

export interface System {
  "system-type": string;
  "system-type-id": number;
  "system-instance-name": string;
  "system-index": number;
  "system-instance-unique-id": number;
  "system-is-active": boolean;
  "system-models": Model[];
}

export interface Model {
  "model-type": string;
  "model-type-id": number;
  "model-instance-name": string;
  "model-path": string;
  "model-instance-unique-id": number;
  "model-is-active": boolean;
  "model-data-items": ModelDataItem[];
}

export interface ModelDataItem {
  "param-data-name": string;
  "param-path": string;
  "param-outline-level": number;
  "param-data-units"?: string;
  "param-data-value": string;
  "non-editable"?: boolean;
}

interface ServerNode {
  "simulation-server-node-id": number;
  "server-node-type": ServerNodeType;
  "server-ip-address": string;
}

enum ServerNodeType {
  simulationController = "simulation-controller",
  remoteServer = "remote-server",
  kubernetes = "kubernetes",
}

export interface RefreshSimulationDataServerResponse {
  "refresh-interval-seconds": number;
  "simulation-session-data": Session;
  "simulation-time-data": TimeInformation;
  "custom-simulation-data": ModelDataItem[];
  "models-data": ModelDataItem[];
}

export interface SimulationEnumType {
  "enum-type": string;
  "enum-values": EnumValue[];
}

export interface EnumValue {
  "enum-value-id": number;
  "enum-value-string": string;
}

export enum ManageSimulationAction {
  clone = "clone",
  delete = "delete",
  generateCode = "generate-code",
  buildExecutable = "build-executable",
}
