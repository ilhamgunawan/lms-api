import { QueryResult } from 'pg';
import db from "./db";

interface User {
  id: string;
  email: string;
  name: string;
}

function getAllUser(): Promise<QueryResult<User>> {
  return db.queryPromise(
    `SELECT u.id, u.name, u.email FROM users u WHERE u.deleted_at IS NULL ORDER BY u.name ASC`,
    [],
  );
}

function getUserByID(id: string): Promise<QueryResult<User>> {
  return db.queryPromise(
    `SELECT u.id, u.name, u.email FROM users u WHERE u.id::text = $1`,
    [id],
  );
}

const User = { getAllUser, getUserByID };

export default User;
