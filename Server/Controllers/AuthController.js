import UserModel from "../Models/userModel.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import randomstring  from "randomstring"
import config from "../config/config.js"
//react
//import ReactDOMServer from 'react-dom/server';
//import React from 'react';
//import EmailVerification from '../../Client/src/pages/EmailVerification/EmailVerification.jsx';

export const securePassword = async(password)=>{
  try {
      const passwordHash = await bcrypt.hash(password, 10);
      return passwordHash;
  } catch (error) {
      console.log(error.message);
  }
}



// Registering a new User
export const registerUser = async (req, res) => {

  const salt = await bcrypt.genSalt(10)
  const hashedPass = await bcrypt.hash(req.body.password, salt);
  req.body.password = hashedPass
  const newUser = new UserModel(req.body);
  const { username } = req.body
  try {
    const oldUser = await UserModel.findOne({ username })
    if (oldUser) {
      return res.status(400).json({ message: 'Username And Email is Already Exists' })
    }
    const user = await newUser.save();
    if (user) {
      
      const token = jwt.sign({
        username: user.username,
        id: user._id
      }, process.env.JWT_KEY, { expiresIn: '1h' })
      sendVerifyMail(req.body.username, req.body.email, user._id);
      console.log(user._id)
    
      res.render("/auth", { message: "Your registration has successfully. Please verify your Email" });
      return res.status(200).json({ message: "Your registration has successfully. Please verify your Email", user, token });

    } else {
      return res.status(400).json({ message: "Your registration has not been successfully." });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// login user
// export const loginUser = async (req, res) => {
//     try {
//       res.render('/auth');
//     } catch (error) {
//       res.json(error)
//     }
// }


export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserModel.findOne({ username: username });


    if (user) {
      const validity = await bcrypt.compare(password, user.password);

      if (!validity) {
        res.status(400).json("wrong password");
      }
      if(validity){
        if(user.is_verified == 0){
          console.log("Please verify your mail first")
           res.render('/auth/login', {message: "Please verify your mail first"})
        }else{
          const token = jwt.sign(
            { username: user.username, id: user._id },
            process.env.JWT_KEY,
            { expiresIn: "1h" }
          );
        
          req.query.id = user._id; // _id: req.query.id
          res.status(200).json({ user, token });
          console.log("successfully login")
          //return res.redirect('/home');
        }
      }
      
      
    }
   else {
    res.status(404).json("User not found");
  }
} catch (err) {
  res.status(500).json(err);
}
};

// for send mail 
export const sendVerifyMail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAILUSER,
        pass: process.env.PASSWORD
      }
    });

    const mailOptions = {
      from: config.emailUser,
      to: email,
      subject: 'For Verification mail',
      html:'<p>Hii '+name+', This is Hari please click here to <a href="http://localhost:3000/verify?id='+user_id+'"> verify </a> your E-mail.</p>'
    }    

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:", info.response);
      }
    });

  } catch (error) {
    console.log(error.message);
  }
};



export const verifyMailAddress = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const updateInfo = await UserModel.updateOne(
      { _id: id, is_verified: 0 },
      { $set: { is_verified: 1 } }
    );

    console.log(updateInfo);

    if (updateInfo) {
      return res.json('Email verified');
    } else if (updateInfo.n === 0) {
      return res.status(404).json({ message: "User not found or already verified" });
    } else {
      return res.status(400).json({ message: "Verification failed" });
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
// forget password create
export const forgetLoad = async(req,res)=>{
  try {
      //res.render('forget');
      res.status(200).json({message: "Enter your email"})
  } catch (error) {
      res.status(400).json(error.message);
  }
}

export const forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    console.log(email);
    const userData = await UserModel.findOne({ email: email });
    
    if (userData) {
      let randomString = randomstring.generate();  // Generate random string
      
      if (userData.is_verified == 0) {
        res.status(200).json({ message: "Please Verify your email first" });
      } else {
        randomString = randomstring.generate();  // Generate another random string
        const updatedData = await UserModel.updateOne({ email: email }, { $set: { token: randomString } });
        console.log(updatedData);
        sendResetPasswordMail(userData.username, userData.email, randomString);
        res.status(200).json({ message: "Please check your mail for reset your password" });
      }
    } else {
      res.status(400).json({ message: "user mail is incorrect" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
//for reset  password sendMail

export const sendResetPasswordMail = async(name, email, token)=>{
  try {
      const transporter =  nodemailer.createTransport({
          host:"smtp.gmail.com",
          port:587,
          secure:false,
          requireTLS:true,
          auth:{
              user:config.emailUser,
              pass:config.emailPassword

          }
      });
      const mailOptions = {
          from:config.emailUser,
          to:email,
          subject:'For Reset Password',
          html:'<p>Hii '+name+', we are here is par click karo to <a href="http://localhost:3000/forget-password?token='+token+'"> Reset</a> your password.</p>'
      }
      transporter.sendMail(mailOptions, function(error,info){
          if(error){
              console.log(error);
          }
          else{
              console.log("Email has been sent:- ",info.response);
          }
      })
  } catch (error) {
      console.log(error.message);
  }
}
export const forgetPasswordLoad = async(req,res)=>{
  try {
      const token = req.query.token;
      const tokenData = await UserModel.findOne({token:token})
      if (tokenData) {
          res.status(200).json({user_id:tokenData._id});
      } else {
          res.status(400).json({message:"Token is invalid."});
      }
  } catch (error) {
      console.log(error.message);
  }
}


export const resetPassword = async (req, res) => {
  try {
    const password = req.body.newPassword;  // Correctly extract the new password
    console.log(password);

    // const email = req.body.email;  // Extract email from the request body
    // console.log(email);

    const secure_password = await securePassword(password);
    const userupdateData = await UserModel.updateOne({ $set: { password: secure_password, token: '' } });
    
    console.log(userupdateData);
    if(userupdateData){
      console.log("your password has been changed");
      res.status(200).json({ message: "your password has been changed" });
    }
    
    
    
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
