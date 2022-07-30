import db from './db';

function createSetting(
  name: string,
  desc: string,
  val: string,
  userID: string
) {
  return db.queryPromise(
    `
      INSERT INTO users_settings
      (name, description, value, user_id)
      values($1, $2, $3, $4)
    `,
    [name, desc, val, userID]
  );
}

const UserSetting = { createSetting };
export default UserSetting;
