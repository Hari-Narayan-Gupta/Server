import mongoose from "mongoose";


const UserSchema = mongoose.Schema(
    {
        username:{
            type:String,
            required:true
        },
        password :{
            type: String,
            required:true
        },
        firstname:{
            type:String,
            required:true
        }, 
        lastname:{
            type:String,
            required: true
        },
        email:{
            type:String,
            // unique: true,
            required: true
        },
        isAdmin:{
            type:Boolean,
            default:false,
        },
        

        profilePicture: String,
        coverPicture:String,
        about:String,
        livesin:String,
        workAt:String,
        relationship:String,
        country:String,
        instagram:String,
        facebook:String,
        twitter:String,
        youtube:String,

        followers : [ ],
        following: [ ],
        is_online:{
           type:String,
           default:0
        },
        is_verified:{
            type:String,
            default:0
        },
        token:{
            type:String,
            default: " "
        },
        blockedUsers:[],
    
    },
    {timestamps:true}
)

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel 