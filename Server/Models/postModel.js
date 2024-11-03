import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    userId: [],
    desc: String,
    likes: [],
    comments:[],
    image: String,
    video: String,
    hashtag: [String],
    hiddenFrom: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }], // Users who cannot see this post

  },
  {
    timestamps: true,
  }
);

var PostModel = mongoose.model("Posts", postSchema);
export default PostModel;