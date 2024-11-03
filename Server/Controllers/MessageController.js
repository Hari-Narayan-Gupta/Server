import MessageModel from "../Models/messageModel.js";

export const addMesssage = async(req, res)=>{
    const {chatId, senderId, text, receiverId, isRead} = req.body
    const message = new MessageModel({
        chatId,
        senderId,
        text,
        receiverId,
        isRead
    });

    try {
        const result = await message.save();
        res.status(200).json(result); 
    } catch (error) { 
        res.status(500).json(error)
    }
}


export const getMessages = async(req, res)=>{
    const {chatId} = req.params;
    try{
        const result = await MessageModel.find({chatId})
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json(error)
    }
}



export const getUnreadMessages = async (req, res) => {
    const { Id } = req.params; // Receiver's ID

    try {
        // Find unread messages for the receiver
        const unreadMessages = await MessageModel.find({
            receiverId: Id,
            isRead: false
        });

        if (unreadMessages.length > 0) {
            // There are unread messages
            res.status(200).json(unreadMessages);
        } else {
            // No unread messages found
            res.status(200).json({ message: "No unread messages found" });
        }
    } catch (error) {
        console.error("Error fetching unread messages:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const markMessageAsRead = async (req, res) => {
    const { senderId, receiverId } = req.params; // Access senderId and receiverId from req.params

    try {
        // Update all unread messages from the sender to the receiver as read
        const updatedMessages = await MessageModel.updateMany(
            { senderId, receiverId },
            {$set: { isRead: true }}
        );
        console.log(updatedMessages)
        if (updatedMessages.nModified > 0) {
            res.status(200).json({ message: "Messages marked as read" });
        } else {
            res.status(200).json({ message: "No messages to mark as read" });
        }
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
};