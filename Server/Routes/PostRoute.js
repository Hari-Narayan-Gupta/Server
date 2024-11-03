import  express from "express";
import { createPost, deletePost, getPost, getTimeLinePosts, likePost, updatePost, commentNow, getAllComments, getFollowingPost, getAllPosts, getTrendingHashtags } from "../Controllers/PostController.js";

const router = express.Router()
router.get('/getPost', getAllPosts)
router.post('/', createPost)
router.get('/:id',getPost)
router.put('/:id',updatePost)
router.delete('/:id',deletePost)
router.put('/:id/like',likePost)
router.get('/:id/timeline',getTimeLinePosts)
router.put('/:id/comment', commentNow)
router.get('/:id/comments',getAllComments)
router.get('/:id/followingPost', getFollowingPost)
router.get('/', getTrendingHashtags)

export default router;