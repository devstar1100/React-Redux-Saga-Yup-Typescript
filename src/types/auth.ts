export enum AuthModules {
  register = "register",
  login = "login",
  resetPass = "resetPass",
}

export interface AuthField {
  type: "text" | "email" | "password";
  label: string;
  name: string;
  placeholder: string;
  fullwidth?: boolean;
  minRows?: number;
  subtitle?: string;
}

export enum LoginType {
  Github = "Github",
  Google = "Google",
  Regular = "Regular",
}

export enum UserRole {
  guest = "guest",
  developer = "developer",
  operator = "operator",
  simulatorManager = "simulator-manager",
  simulatorAdmin = "simulator-admin",
  superAdmin = "super-admin",
}

export enum UserStatus {
  active = "active",
  inactive = "inactive",
  blocked = "blocked",
}

export interface UserData {
  "user-id": number;
  "user-name": string;
  "first-name": string;
  "last-name": string;
  "user-role": UserRole;
  "user-status": UserStatus;
  "access-token": string;
  "last-login-date": string;
}
