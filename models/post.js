const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 50,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  public: {
    type: Boolean,
    required: true,
  },
  timestamp: {
    type: Date,
  },
});

PostSchema.virtual("url").get(function () {
  return `/blog/post/${this._id}`;
});

module.exports = mongoose.model("Post", PostSchema);
