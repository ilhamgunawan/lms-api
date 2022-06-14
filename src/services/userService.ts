import User from "../database/User"

const getAllUser = async () => {
  const result = await User.getAllUser();
  return result.rows;
}

const getUserByID = async (id: string) => {
  const result = await User.getUserByID(id);
  return result.rowCount === 1 ? result.rows[0] : null;
}

const userService = { getAllUser, getUserByID };

export default userService;