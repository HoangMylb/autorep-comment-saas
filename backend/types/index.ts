export interface RequestUser {
  id: string;
  email?: string;
  role: "admin" | "user";
  status: "active" | "blocked";
}

export interface ServiceContext {
  user: RequestUser;
}
