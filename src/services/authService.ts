import Auth from '../database/Auth';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const tokenGenSecret = process.env.TOKEN_GEN_SECRET ? process.env.TOKEN_GEN_SECRET : '';

const createLogin = async (email: string, password: string) => {
  const result = await Auth.getUserByEmail(email);
  const user = result.rows[0];
  const isPassValid = bcrypt.compareSync(password, user.password);
  if (user && isPassValid) {
    const roleResult = await Auth.getDefaultRoleByUserID(user.id);
    const defaultRole = roleResult.rows[0];
    const login = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: {
        id: defaultRole.role_id,
        name: defaultRole.name,
      },
    };
    const token = jwt.sign(login, tokenGenSecret, { expiresIn: '7d' });
    await Auth.insertLoginTemp(user.id, token);
    return {login, token};
  }
  return {login: null, token: null};
};

const deleteLogin = async (userID: string, token: string) => {
  await Auth.deleteLoginTemp(userID, token);
  return true;
};

const getSessionStatus = () => {
  return;
};

const getCurrentRole = async (roleID: string) => {
  const role = await Auth.getRole(roleID);
  return role;
};

const authService = {
  createLogin,
  deleteLogin,
  getSessionStatus,
  getCurrentRole,
};

export default authService;
