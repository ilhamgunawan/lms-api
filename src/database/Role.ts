import db from './db';

function getRoleByName(name: string) {
  return db.queryPromise(
    `
      SELECT r.id, r.name FROM roles r
      WHERE r.name = $1 AND r.deleted_at IS NULL
    `,
    [name]
  );
}

function createRoleToUser(roleID: string, userID: string) {
  return db.queryPromise(
    `
      INSERT INTO users_to_roles
      (user_id, role_id)
      values($1, $2)
    `,
    [userID, roleID]
  );
}

const Role = { createRoleToUser, getRoleByName };
export default Role;
