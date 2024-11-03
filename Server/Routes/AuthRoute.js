import  express  from "express";
import auth from "../MiddleWare/authMiddleWare.js";

import { loginUser, registerUser, verifyMailAddress, forgetLoad,  forgetVerify, forgetPasswordLoad, resetPassword} from "../Controllers/AuthController.js";

const router = express.Router()

//router.get('/register', auth.isLogout, registerUser) 
router.post('/register', registerUser)
router.get('/login',auth.isLogout, loginUser)
router.post('/login', loginUser)
router.put("/verify", verifyMailAddress);
router.get('/forget', auth.isLogout, forgetLoad)
router.post('/forget', forgetVerify)
router.get('/forget-password', auth.isLogout, forgetPasswordLoad)
router.post('/forget-password', resetPassword)

export default router