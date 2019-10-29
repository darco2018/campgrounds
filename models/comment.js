const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  text: {type: String, required: true, trim: true},
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
});

commentSchema.virtual("url").get(()=>
  '/catalogue/comment' + this.id
)

module.exports = mongoose.model('Comment', commentSchema);
