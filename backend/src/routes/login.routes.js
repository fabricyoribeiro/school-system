//ROTAS DE ADMIN
import autenticateToken from "../middleware/authenticateToken.js";
import authorizeRoles from "../middleware/authorizeRoles.js";
import login from "../modules/login/index.js";
import { Router } from "express";

const loginRoutes = Router();

loginRoutes.post('/', login.login)

export {loginRoutes}
