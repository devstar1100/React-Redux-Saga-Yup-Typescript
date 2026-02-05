import { dateFormatWithTime } from "../../../lib/dateFormat";
import { ConfigurationFile } from "../../../types/configurationFile";

export const editConfigurationInitialState: ConfigurationFile = {
  "configuration-name": "",
  "simulation-user-config-id": 0,
  "user-config-file-name": "",
  "simulation-id": 0,
  "simulation-name": "",
  "simulation-owner-name": "",
  "default-initial-conditions-name": "",
  "initial-conditions-overide-name": "",
  "scenario-file-id": 0,
  "scenario-file-name": "",
  "pod-identifier": "",
  "pod-deployment-file-name": "",
  "pod-deployment-namespace": "",
  "containers-repository-path": "",
  "creation-date": dateFormatWithTime(new Date()),
  "last-update-date": dateFormatWithTime(new Date()),
  "path-to-documentation": "",
};

export const editConfigurationInitialErrorsState: Record<keyof ConfigurationFile, string> = {
  "configuration-name": "",
  "simulation-user-config-id": "",
  "user-config-file-name": "",
  "simulation-id": "",
  "simulation-name": "",
  "simulation-owner-name": "",
  "default-initial-conditions-name": "",
  "initial-conditions-overide-name": "",
  "scenario-file-id": "",
  "scenario-file-name": "",
  "pod-identifier": "",
  "pod-deployment-file-name": "",
  "pod-deployment-namespace": "",
  "containers-repository-path": "",
  "creation-date": "",
  "last-update-date": "",
  "path-to-documentation": "",
};
