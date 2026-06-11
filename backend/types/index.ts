export interface RequestUser {
  id: string;
  email?: string;
  role: "admin" | "user";
}

export interface ServiceContext {
  user: RequestUser;
}
