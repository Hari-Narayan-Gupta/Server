import UserModel from "../Models/userModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

//  get all users 

export const getAllUsers = async(req, res)=>{
    try{
        let users = await UserModel.find();

        users = users.map((user)=>{
            const {password, ...otherDetails} = user._doc
            return otherDetails
        })
        res.status(200).json(users)
    }catch(error){
        res.status(500).json(error)
    }
}


// get a User

export const getUser = async(req, res)=>{
    const id = req.params.id;

    try {
        const user = await UserModel.findById(id);

        if(user){
             const {password, ...otherdetails} = user._doc
            res.status(200).json(otherdetails)
        }else{
            res.status(404).json("No user found")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


// update a user

export const updateUser = async (req, res)=>{
    const id = req.params.id;
    const {_id, currentUserAdminStatus, password} = req.body;

    if(id === _id){
        try {
            if(password){
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(password, salt);
            }
            const user = await UserModel.findByIdAndUpdate(id, req.body, {new:true})
            const token = jwt.sign(
                {username:user.username, id:user._id},
                process.env.JWT_KEY, {expiresIn:"1h"}
            );
            res.status(200).json({user, token});
        } catch (error) {
            res.status(500).json(error);
        }
    }else{
        res.status(403).json("Access Denied! you can only update your own profile")
    }
}


// Delete user

export const deleteUser = async (req, res)=>{
    const id = req.params.id;

    const {currentUserId, currentUserAdminStatus} = req.body

    if(currentUserId === id || currentUserAdminStatus){
        try{
            await UserModel.findByIdAndDelete(id)
            res.status(200).json("User deleted Successfully")
        }catch (error){
            res.status(500).json(error);
        }
    }
    else{
        res.status(403).json("Access Denied! you can only delete your own profile")
    }
}

// Follow a User
// changed
export const followUser = async (req, res) => {
    const id = req.params.id; //hari
    const { _id } = req.body; //vishal
    console.log(id, _id)
    if (_id == id) {
      res.status(403).json("Action Forbidden");
    } else {
      try {
        const followUser = await UserModel.findById(id);//hari
        const followingUser = await UserModel.findById(_id);//vishal
  
        if (!followUser.followers.includes(_id)) {
            const followerData = {
                _id: followingUser.id,
                username: followingUser.username,
                profilePicture: followingUser.profilePicture
            }
            
            // const followingData = {
            //     _id:followUser._id,
            //     // username: followUser.username,
            //     // profilePicture: followUser.profilePicture
            // }
           

          await followUser.updateOne({ $push: { followers: followerData } });
    
          await followingUser.updateOne({ $push: { following: id} });

          res.status(200).json("User followed!");
        } else {
          res.status(403).json("you are already following this id");
        }
      } catch (error) {
        console.log(error)
        res.status(500).json(error);
      }
    }
  };

  
//Unfollow a User 
export const unfollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;
  console.log(id, _id)

  try {
      // Find the user to unfollow
      const followUser = await UserModel.findById(id);//vishal
      if (!followUser) {
          return res.status(404).json("User not found");
      }

      // Find the current user
      const currentUser = await UserModel.findById(_id);
      if (!currentUser) {
          return res.status(404).json("Current user not found");
      }

      // Check if the current user is already following the user to unfollow
      const followingIndex = currentUser.following.indexOf(id);
      if (followingIndex === -1) {
          return res.status(403).json("User is not followed by you");
      }

      // Unfollow the user
      currentUser.following.splice(followingIndex, 1); // Remove user ID from following array
      await currentUser.save(); // Save changes to current user

      // Remove current user from the followers array of the user to unfollow
      followUser.followers = followUser.followers.filter(follower => follower._id.toString() !== _id);
      await followUser.save(); // Save changes to user to unfollow

      return res.status(200).json({ message: "User Unfollowed!" });
  } catch (error) {
      return res.status(500).json(error);
  }
};


//Made by Vishal Raj
export const followList = async(req, res) =>{
    try{
        const {_id} = req.body;
        let followersData = await UserModel.find(_id);

        followersData = followersData.map((user)=>{
            const {followers,...otherDetails} = user._doc
            return followers
        })
        res.status(200).json(followersData)
    }catch(error){
        res.status(500).json(error)
    }
}

// getUserProfile

export const getUserProfile = async (req, res) => {
    const  { id }  = req.params;
    
    try {
      const user = await UserModel.findOne({_id: id});
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const Userprofile = {
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        followers: user.followers,
        following: user.following,
        profilePicture: user.profilePicture,
        coverPicture: user.coverPicture,
        is_online: user.is_online
      }
       // Send the user's profile data
       res.status(200).json(Userprofile);
    
     
    } catch (error) {
      res.status(500).json(error);
    }
  };

  

// block Users
export const BlockUser = async (req, res) => {
  const { id } = req.params; // ID of the user to be blocked
  const { userId } = req.body; // ID of the user performing the block

  console.log("BlockUser endpoint called with:", { userId, id });

  try {
    // Find the user who wants to block another user
    const user = await UserModel.findById(userId);
    if (!user) {
      console.error("Blocking user not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user to be blocked exists
    const userToBlock = await UserModel.findById(id);
    if (!userToBlock) {
      console.error("User to block not found:", id);
      return res.status(404).json({ message: "User to block not found" });
    }

    // Add the user to the block list if not already blocked
    if (!user.blockedUsers.includes(id)) {
      user.blockedUsers.push(id);
      console.log(user.blockedUsers)

      // Remove userToBlock from user's followers list
      user.followers = user.followers.filter(follower => follower._id.toString() !== id);
      // Remove userToBlock from user's following list
      user.following = user.following.filter(followingId => followingId.toString() !== id);

      // Remove user from userToBlock's followers list
      userToBlock.followers = userToBlock.followers.filter(follower => follower._id.toString() !== userId);
      // Remove user from userToBlock's following list
      userToBlock.following = userToBlock.following.filter(followingId => followingId.toString() !== userId);

      // Save the changes to the database
      await user.save();
      await userToBlock.save();

      return res.status(200).json({ message: "User blocked successfully", user});
    } else {
      return res.status(400).json({ message: "User already blocked" });
    }
  } catch (error) {
    console.error("Error blocking user:", error); // Log the error for debugging
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};

//unblock

export const UnblockUser = async (req, res) => {
  const { id } = req.params; // ID of the user to be unblocked
  const { userId } = req.body; // ID of the user performing the unblock

  console.log("UnblockUser endpoint called with:", { userId, id });

  try {
    // Find the user who wants to unblock another user
    const user = await UserModel.findById(userId);
    if (!user) {
      console.error("Unblocking user not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user to be unblocked exists
    const userToUnblock = await UserModel.findById(id);
    if (!userToUnblock) {
      console.error("User to unblock not found:", id);
      return res.status(404).json({ message: "User to unblock not found" });
    }

    // Remove the user from the block list if currently blocked
    if (user.blockedUsers.includes(id)) {
      user.blockedUsers = user.blockedUsers.filter(blockedUserId => blockedUserId.toString() !== id);

      // Save the changes to the database
      await user.save();

      return res.status(200).json({ message: "User unblocked successfully", user });
    } else {
      return res.status(400).json({ message: "User is not blocked" });
    }
  } catch (error) {
    console.error("Error unblocking user:", error); // Log the error for debugging
    return res.status(500).json({ message: "An error occurred", error: error.message });
  }
};


//get list of block users
export const getBlockUsers = async(req, res) =>{
  const { id } = req.params;
  console.log(id);
  try {
       const getdata = await UserModel.findById({_id:id});
       console.log(getdata)
       let data = getdata.blockedUsers;
       res.status(200).json(data)
      
  } catch (error) {
      res.status(500).json("Internal Server Error")
  }
}
  