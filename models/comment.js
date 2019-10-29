const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {type: String, required: true, trim: true},
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
});

const commentModel = mongoose.model('Comment', commentSchema);

module.exports = {
  commentSchema,
  commentModel
  // method: function()
};
