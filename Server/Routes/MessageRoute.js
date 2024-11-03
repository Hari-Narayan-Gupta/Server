import express from 'express'
import { addMesssage, getMessages, getUnreadMessages, markMessageAsRead } from '../Controllers/MessageController.js'

const router = express.Router()

router.post('/', addMesssage)
router.get('/:chatId', getMessages)
router.put('/read/:senderId/:receiverId', markMessageAsRead); // Define route to mark message as read
router.get('/unread/:Id', getUnreadMessages); // Define route to get unread messages

export default router 