const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: String,
  author: String,
});

console.log('Compiling Comment schema');

module.exports = {
  commentSchema,
  commentModel: mongoose.model('Comment', commentSchema),
  // method: function()
};
