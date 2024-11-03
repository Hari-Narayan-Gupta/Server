import { compareSync } from "bcrypt";
import PostModel from "../Models/postModel.js";
import mongoose from "mongoose";
import UserModel from '../Models/userModel.js'


// create new post 
export const createPost = async (req, res) => {
    const newPost = new PostModel(req.body)
    try {
        const data = req.body.userId;
        const fetchData = await UserModel.findById(data);
        // console.log(fetchData);
        newPost.userId.push({
            id: fetchData._id,
            username: fetchData.username,
            profilePicture: fetchData.profilePicture
        });
    //    console.log(newPost.profilrPicture)
        const datag = await newPost.save()
        console.log("officer " + datag)
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json(error)
    }
}


// Get a post

export const getPost = async (req, res) => {
    const id = req.params.id
    try {
        const post = await PostModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//Update a post
export const updatePost = async (req, res) => {
    const postId = req.params.id
    const { userId } = req.body

    try {
        const post = await PostModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json('Post Updated')
        } else {
            res.status(401).json('Unauthorized Access')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Delete a post

export const deletePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(id);
        if (!post) {
            return res.status(404).json("Post not found");
        }

        // Check if the userId provided in the request body exists in the post's userId array
        if (post.userId.includes(userId)) {
            await post.deleteOne(); // Correct method call to delete the post
            res.status(200).json("Post Deleted!");
            console.log("Deleted...");
        } else {
            res.status(401).json('Unauthorized Access');
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

// like/ dislike a post

export const likePost = async (req, res) => {
    const id = req.params.id
    const { userId } = req.body

    try {
        const post = await PostModel.findById(id)
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("Post Liked!")
        } else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("Post UnLiked!")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

// Get Timeline Posts

export const getTimeLinePosts = async (req, res) => {
    const userId = req.params.id

    try {
        const currentUserPosts = await PostModel.find({ userId: userId })
        const followingPosts = await UserModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "following",
                    foreignField: "userId",
                    as: "followingPosts"
                }
            },
            {
                $project: {
                    followingPosts: 1,
                    _id: 0
                }
            }
        ])
        res.status(200).json(currentUserPosts.concat(...followingPosts[0].followingPosts)
            .sort((a, b) => {
                return b.createdAt - a.createdAt;
            })
        )
    } catch (error) {
        res.status(500).json(error)
    }

}

// comment API
// export const commentNow = async (req, res) => {
//     const postId = req.params.id;
//     console.log(postId)
//     try {
//         // Extract comment data from request body 
//         const { text, postedBy, } = req.body;

//         // Find the post by its ID
//         const post = await PostModel.findById(postId);
//         const id = post.userId

//         const userData = await UserModel.findById({_id: id})
//         userData = userData.map((user)=>{
//             const {username, profilePicture} = user.doc
//             return {
//                 username,
//                 profilePicture
//             }
//         })

//         if (!post) {
//             return res.status(404).json({ message: "Post not found" });
//         }

//         // Add the comment to the post's comments array
//         post.comments.push({
//             text: text,
//             postedBy: postedBy,
//             username: userData.username,
//             profilePicture: userData.profilePicture
//         });

//         // Save the updated post
//         await post.save();

//         // Return success response
//         return res.status(200).json({ message: "Comment added successfully" });
//     } catch (error) {
//         // Handle any errors
//         console.error("Error adding comment:", error);
//         return res.status(500).json({ error: "Internal server error" });
//     }
// };
export const commentNow = async (req, res) => {
    const postId = req.params.id;
    console.log(postId);
    try {
        // Extract comment data from request body 
        const { text, postedBy } = req.body;

        // Find the post by its ID
        const post = await PostModel.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Extract user data from post's userId field
        let userData;
        if (Array.isArray(post.userId)) {
            const userObject = post.userId.find(item => typeof item === 'object');
            if (userObject) {
                userData = userObject;
            } else {
                // Fetch user data based on userId
                const userId = post.userId[0]; // Assuming first element is the userId
                userData = await UserModel.findById(userId);
                if (!userData) {
                    return res.status(404).json({ message: "User not found" });
                }
            }
        } else {
            // Fetch user data based on userId
            const userId = post.userId;
            userData = await UserModel.findById(userId);
            if (!userData) {
                return res.status(404).json({ message: "User not found" });
            }
        }

        // Add the comment to the post's comments array
        post.comments.push({
            text: text,
            postedBy: postedBy,
            username: userData.username,
            profilePicture: userData.profilePicture
        });

        // Save the updated post
        await post.save();

        // Return success response
        return res.status(200).json({ message: "Comment added successfully" });
    } catch (error) {
        // Handle any errors
        console.error("Error adding comment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



//get all comments
export const getAllComments = async (req, res) => {
    const postId = req.params.id;
    console.log(postId)
    try {
        const post = await PostModel.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Extract comments from the post
        const comments = post.comments;

        // Log comments to the console
        console.log("Comments for post with ID", postId);
        console.log(comments);

        res.status(200).json(comments); // Optionally, return the comments in the response
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
//get following post
export const getFollowingPost = async (req, res) => {
    const id = req.params.id;
    try {
        // Find the user document of the current user
        const currentUser = await UserModel.findById(id);
        console.log(id)

        // Get the IDs of users that the current user is following
        const followingUserIds = currentUser.following;
        console.log(followingUserIds)

        // Find posts created by users that the current user is following
        const followingPosts = await PostModel.find({ userId: { $in: followingUserIds } });
        console.log(followingPosts)

        // Send the posts as a response
        res.json(followingPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}


//  get all post
export const getAllPosts = async (req, res) => {
    const id = req.params
    try {
        const posts = await PostModel.find();
        // console.log(posts)

        // posts = posts.map((post) => {
        //     const { comments, ...otherDetails } = post._doc
        //     return otherDetails
        //})
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json("No error")
    }
}
//get hashtags 
export const getTrendingHashtags = async (req, res) => {
    try {
        // Retrieve posts from the database
        const posts = await PostModel.find();
        
        // Initialize an object to store hashtag counts
        const hashtagCounts = {};

        // Iterate through each post
        posts.forEach(post => {
            // Check if post.desc is defined
            if (post.desc) {
                // Extract hashtags from the description using a regular expression
                const hashtags = post.desc.match(/#[a-zA-Z0-9]+/g);
                
                // Increment the count for each hashtag
                if (hashtags) {
                    hashtags.forEach(hashtag => {
                        const cleanedHashtag = hashtag.toLowerCase(); // Convert to lowercase for case-insensitive counting
                        hashtagCounts[cleanedHashtag] = (hashtagCounts[cleanedHashtag] || 0) + 1;
                    });
                }
            }
        });

        // Convert hashtag counts to an array of objects
        const hashtagArray = Object.keys(hashtagCounts).map(hashtag => ({ hashtag, count: hashtagCounts[hashtag] }));

        // Sort the hashtag array by count in descending order
        hashtagArray.sort((a, b) => b.count - a.count);

        // Select the top trending hashtags
        const trendingHashtags = hashtagArray.slice(0, 10); // Change 10 to the desired number of trending hashtags

        // Return the trending hashtags
        res.status(200).json(trendingHashtags);
    } catch (error) {
        console.error("Error fetching trending hashtags:", error);
        res.status(500).json({ message: "Error fetching trending hashtags", error: error.message });
    }
};


// export const getTrendingHashtags = async (req, res) => {
//     try {
//         // Retrieve posts from the database
//         const posts = await PostModel.find();
        
//         // Initialize an object to store hashtag counts
//         const hashtagCounts = {};

//         // Iterate through each post
//         posts.forEach(post => {
//             // Extract hashtags from the description using a regular expression
//             const hashtags = post.desc.match(/#[a-zA-Z0-9]+/g);
//             // console.log(hashtags)
            
//             // Increment the count for each hashtag
//             if (hashtags) {
//                 hashtags.forEach(hashtag => {
//                     const cleanedHashtag = hashtag.toLowerCase(); // Convert to lowercase for case-insensitive counting
//                     hashtagCounts[cleanedHashtag] = (hashtagCounts[cleanedHashtag] || 0) + 1;
//                 });
//             }
//         });

//         // Convert hashtag counts to an array of objects
//         const hashtagArray = Object.keys(hashtagCounts).map(hashtag => ({ hashtag, count: hashtagCounts[hashtag] }));

//         // Sort the hashtag array by count in descending order
//         hashtagArray.sort((a, b) => b.count - a.count);

//         // Select the top trending hashtags
//         const trendingHashtags = hashtagArray.slice(0, 10); // Change 10 to the desired number of trending hashtags

//         // Return the trending hashtags
//         res.status(200).json(trendingHashtags);
//     } catch (error) {
//         console.error("Error fetching trending hashtags:", error);
//         res.status(500).json({ message: "Error fetching trending hashtags", error: error.message });
//     }
// };