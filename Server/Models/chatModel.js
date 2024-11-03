import mongoose from "mongoose"; 
//import UserModel from "../Models/userModel.js";

const ChatSchema = mongoose.Schema(
    {
        members: {
             type: Array      
        },        
    },
    {
        timestamps: true,
    }
);
const ChatModel = mongoose.model("Chat", ChatSchema)
export default ChatModel

