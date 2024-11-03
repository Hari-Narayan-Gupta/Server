import express from 'express'
import { unfollowUser, deleteUser, followUser, getAllUsers, getUser, updateUser, followList, getUserProfile, BlockUser, getBlockUsers, UnblockUser } from '../Controllers/UserController.js'


const router = express.Router()

router.get('/blocked-users/:id', getBlockUsers)
router.get('/:id', getUser);
router.get('/',getAllUsers)
router.put('/:id', updateUser) 
router.delete('/:id', deleteUser)
router.put('/:id/follow', followUser)
router.put('/:id/unfollow', unfollowUser)
router.post("/:id", followList);
router.get("/profile/:id", getUserProfile)
router.post("/block-user/:id", BlockUser)
router.post("/unblock/:id", UnblockUser)


export default router