import { Router } from "express";
import { addUser, resetPassword, searchUsersByName, signinUser } from "../controllers/userControllers";
import { verifyToken } from "../middlewares/jwtToken";


const userRoutes= Router()

userRoutes.post('', addUser)
userRoutes.post('/signin', signinUser)
userRoutes.patch('', resetPassword)
userRoutes.get('/u/:name', verifyToken, searchUsersByName)


export default userRoutes