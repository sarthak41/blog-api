const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  username: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
});

CommentSchema.virtual("url").get(function () {
  return `/blog/comment/${this._id}`;
});

module.exports = mongoose.model("Comment", CommentSchema);
