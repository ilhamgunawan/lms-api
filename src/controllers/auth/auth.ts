import loginController from "./login";
import logoutController from './logout';
import currentRoleController from "./current-role";

const authController = { loginController, logoutController, currentRoleController };
export default authController;
