const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  author: String,
});

const commentModel = mongoose.model('Comment', commentSchema);

module.exports = {
  commentSchema,
  commentModel,
  // method: function()
};
