import mongoose from "mongoose";


// Define Notification schema
const NotificationSchema = new mongoose.Schema({

    userId: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Users', required: true 
        },
    postId: {
        type: String
    },    
    type: { 
        type: String,
        enum: ['like', 'comment', 'follow'], 
        required: true 
    },
    content: { 
        type: String,
        required: true 
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    },
    isRead:{
        type:String,
        default: false
    }
});

// Create Notification model
const NotificationModel = mongoose.model('Notification', NotificationSchema);

export default  NotificationModel;