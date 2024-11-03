import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWTKEY;
const authMiddleWare = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    console.log(token)
    if (token) {
      const decoded = jwt.verify(token, secret);
      console.log(decoded)
      req.body._id = decoded?.id;
    }
    next();
  } catch (error) {
    console.log(error);
  }
};

const isLogin = (req) => {
    const token = req.headers.authorization?.split(" ")[1];
    try {
      if (token) {
        jwt.verify(token, secret);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };
  
  const isLogout = (req) => {
    return !isLogin(req);
  };
  
  export default {
    authMiddleWare,
    isLogin,
    isLogout,
  };