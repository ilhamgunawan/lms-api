export interface Menu {
  id: string;
  name: string;
  parent_id: string | null;
  path: string | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}
