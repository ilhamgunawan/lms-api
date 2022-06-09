export interface User {
  id: string;
  name: string;
  password: string;
  email: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export type Users = Array<User>;
