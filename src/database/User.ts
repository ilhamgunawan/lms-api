import { QueryResult } from 'pg';
import db from "./db";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface CreateUser {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUser {
  name: string | null;
  email: string | null;
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

function createUser(user: CreateUser) {
  return db.queryPromise(
    `
      INSERT INTO users
      (name, email, password, updated_at, deleted_at)
      values($1, $2, $3, NULL, NULL)
      RETURNING *
    `,
    [user.name, user.email, user.password],
  );
}

function deleteUser(id: string) {
  return db.queryPromise(
    `
      UPDATE users
      SET deleted_at=now()
      WHERE id=$1::uuid
    `,
    [id],
  );
}

function updateUser(set: string, where: string, data: Array<string>) {
  return db.queryPromise(
    `
      UPDATE users
      SET ${set} updated_at=now()
      WHERE ${where}
    `,
    data,
  );
}

const User = { getAllUser, getUserByID, createUser, deleteUser, updateUser };

export default User;
