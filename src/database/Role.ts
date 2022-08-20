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

function getUserRoles(userId: string) {
  return db.queryPromise(
    `
      SELECT utr.id, r."name", r.id as role_id  FROM users_to_roles utr 
      LEFT JOIN "roles" r on r.id = utr.role_id 
      WHERE utr.user_id = $1
    `,
    [userId]
  );
}

const Role = { createRoleToUser, getRoleByName, getUserRoles };
export default Role;
