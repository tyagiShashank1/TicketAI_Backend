import {Router} from "express"
import { isAuthenticated } from "../middlewares/auth.js";
import { createUser, getUsers, loginUser, logoutUser, updateUser } from "../controllers/userController.js";
const router = Router();



//GET ALL USERS (ADMIN)
router.get('/',isAuthenticated,getUsers);

//REGISTER
router.post('/add',createUser);

//LOGIN
router.post('/login',loginUser);

//LOGOUT
router.get('/logout',logoutUser);

//UPDATE USER
router.post('/update-user',isAuthenticated,updateUser);

export default router;