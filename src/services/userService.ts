import User, { UpdateUser } from "../database/User"
import Role from '../database/Role'
import UserSetting from '../database/UserSetting'
import bcrypt from 'bcrypt';
import { client } from '../database/db';

const getAllUser = async () => {
  const result = await User.getAllUser();
  return result.rows;
}

const getUserByID = async (id: string) => {
  const result = await User.getUserByID(id);
  return result.rowCount === 1 ? result.rows[0] : null;
}

const createUser = async (name: string, email: string, role: string) => {
  const defaultPassword = process.env.DEFAULT_CREATE_USER_PASS as string;
  const password = bcrypt.hashSync(defaultPassword, 10);
  const result = await User.createUser({name, email, password});
  const createdUser = result.rows[0] as {id: string; name: string; email: string};
  const getRoleResult = await Role.getRoleByName(role);
  const roleByName = getRoleResult.rows[0] as {id: string; name: string};
  await Role.createRoleToUser(roleByName.id, createdUser.id);
  await UserSetting.createSetting('default_role', 'default_role', roleByName.id, createdUser.id);
  return result.rowCount;
}

const deleteUser = async (id: string) => {
  const result = await User.deleteUser(id);
  return result.rowCount;
}

const updateUser = async (id: string, data: UpdateUser) => {
  let set = "";
  const where = "id=$1::uuid";
  const list = [id];
  if (data.name) {
    list.push(data.name);
    const index = list.indexOf(data.name) + 1;
    set = `name=$${index},`;
  }
  if (data.email) {
    list.push(data.email);
    const index = list.indexOf(data.email) + 1;
    set = `${set} email=$${index},`;
  }
  if (set) {
    await User.updateUser(set, where, list);
    return true;
  }
  return false;
}

const userService = { getAllUser, getUserByID, createUser, deleteUser, updateUser };

export default userService;