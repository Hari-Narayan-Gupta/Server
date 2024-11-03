import UserModel from "../Models/userModel.js";
import NotificationModel from "../Models/notificationModel.js";
import PostModel from "../Models/postModel.js"



// Create a new notification
export const createNotification = async (req, res) => {
    const id = req.params
    const { userId, type, content, postId } = req.body;
    try {
        const user = await UserModel.findById({_id: userId})
    
        const post = await PostModel.findById({_id: postId})
        const value = post.desc
        

        const notification = new NotificationModel({ userId, type, content, postId });
        await notification.save();
        const usrname = user.username


        // Handle different types of notifications
        let responseMessage = '';
        switch (type) {
            case 'like':
                responseMessage = `${usrname} liked your post ..${value}`;
                break;
            case 'comment':
                responseMessage = `${usrname} commented on your post ..${value}`;
                break;
            case 'follow':
                responseMessage = `${usrname} started following you ..${value}`;
                break;
            default:
                responseMessage = 'New notification received';
        }

        // Send response
        res.status(201).json({ message: responseMessage, notification });

    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
};
// Fetch notifications for a specific user
export const getNotificationsForUser = async (req, res) => {
    const { userId } = req.query;
    try {
        const notifications = await NotificationModel.findMany({ userId }).sort({ createdAt: -1 });
        // return notifications;
        res.status(200).json(notifications);
    } catch (error) {
        //console.error('Error fetching notifications:', error);
        res.status(500).json('Failed to fetch notifications');
    }
};

    //get which user react on my post
    // export const getReact = async (req, res) => {
    //     const { userId } = req.query;
    //     try {
    //         // Find the post by userId
    //         const postData = await PostModel.findOne({ userId });
    //         const data = postData._id
    //         console.log(data)
    //         // If the post is found, extract the userId
    //         if (data) {
    //         // const userValue = postData.userId[1].id;
    //             //console.log("a "+ userValue);

    //             // Fetch notifications related to the post's userId
    //             const notifications = await NotificationModel.find({ postId: data });

    //             // Respond with the fetched notifications
    //             res.status(200).json({ notifications });
    //         } else {
    //             // If the post is not found, respond with a 404 status code
    //             res.status(404).json({ message: 'Post not found' });
    //         }
    //     } catch (error) {
    //         console.error('Error fetching reactions:', error);
    //         res.status(500).json({ error: 'Internal server error' });
    //     }
    // };
    export const getReact = async (req, res) => {
        const { userId } = req.query;
        try {
            // Find all posts by userId
            const postData = await PostModel.find({ userId });
    
            // Extract postIds from the found posts
            const postIds = postData.map(post => post._id);   
    
            // Fetch notifications related to the found postIds
            const notifications = await NotificationModel.find({ postId: { $in: postIds } });
    
            // Respond with the fetched notifications
            res.status(200).json({ notifications });
        } catch (error) {
            console.error('Error fetching reactions:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };


// Get notificaion of user
export const getData = async(req, res)=> {
    const { notificationId } = req.params;
    try {
         // Find the notification by its ID
         const notification = await NotificationModel.findById(notificationId);

         // Check if the notification exists
         if (!notification) {
             return res.status(404).json({ error: 'Notification not found' });
         }
 
         // Redirect to the post associated with the notification
         const post = await PostModel.findById(notification.postId);
         if (!post) {
             return res.status(404).json({ error: 'Post not found' });
         }
         // Redirect to the post route
         return res.redirect(`/post/${notification.postId}`); // Modify the route as per your application's setup
        
    } catch (error) {
        res.status(500).json("Internal server error");
    }
}



//unread notification
export const getUnreadNotificationCount = async (req, res) => {
    const { userId } = req.query;
    try {
        // Find the post by userId
        const postData = await PostModel.findOne({ userId });
        const postId = postData._id;

        // If the post is found, extract the postId
        if (postId) {
            // Fetch unread notifications related to the post's postId
            const unreadNotificationsCount = await NotificationModel.countDocuments({ postId, isRead: false });

            // Respond with the count of unread notifications
            res.status(200).json({ unreadNotificationsCount });
        } else {
            // If the post is not found, respond with a 404 status code
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        console.error('Error fetching unread notification count:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//getRead notification
export const markNotificationAsRead = async (req, res) => {
    const { userId } = req.query;
    console.log(userId)
    try {
        // Find posts belonging to the user
        const posts = await PostModel.find({ userId });
        // Extract ids of these posts
        const postIds = posts.map(post => post._id);
        console.log(postIds);
        
        // Find notifications where postId matches with the postIds
        const notificationsToUpdate = await NotificationModel.find({ postId: { $in: postIds } });
        
        // Update each notification and set isRead to true
        const updatePromises = notificationsToUpdate.map(async notification => {
            notification.isRead = true;
            await notification.save();
            return notification;
        });
        
        // Wait for all updates to complete
        const updatedNotifications = await Promise.all(updatePromises);
        
        // Respond with the updated notifications
        res.status(200).json(updatedNotifications);
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal Server Error");
    }
}

//get post on activity

// export const getActivity = async (req, res) => {
//     const  userId  = req.params;
//     console.log(userId);

//     try {
//         const notificationData = await NotificationModel.findById({userId:userId});
//         console.log(notificationData);

//         if (!notificationData) {
//             return res.status(404).json("Notifications not found for this user");
//         }

//         const postId = notificationData.postId;

//         const postData = await PostModel.findById(postId);
//         console.log(postData);

//         if (!postData) {
//             return res.status(404).json("Post not found");
//         }

//         res.status(200).json(postData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json("Internal Server Error");
//     }
// };

export const getActivity = async (req, res) => {
    const  userId  = req.params; // Access userId from req.query
    console.log(userId);

    try {
        const notificationData = await NotificationModel.find(userId);
        console.log(notificationData);

        if (!notificationData) {
            return res.status(404).json("Notifications not found for this user");
        }

        // Extract all postId values from notificationData
        const postIds = notificationData.map(notification => notification.postId);
        console.log(postIds);

        const postData = await PostModel.find({ _id: { $in: postIds } });
        console.log(postData);

        // const postId = notificationData.postId; 
        // console.log(postId)

        // const postData = await PostModel.find(postId);
        // console.log(postData);

        if (!postData) {
            return res.status(404).json("Post not found");
        }

        res.status(200).json(postData);
    } catch (error) {
        console.error(error);
        res.status(500).json("Internal Server Error");
    }
};
