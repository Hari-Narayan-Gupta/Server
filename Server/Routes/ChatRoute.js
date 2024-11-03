import express from 'express'
import { createChat, findChat, userChats } from '../Controllers/ChatController.js'

const router = express.Router()


router.post("/", createChat) //working
router.get("/:userId", userChats)  // working
router.get("/find/:firstId/:secondId", findChat) //working
//router.get("/chat", getChatMembers)
//router.get("/:userId",chatData)

export default router