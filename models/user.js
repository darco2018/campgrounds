const mongoose = require('mongoose');
const passwordLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passwordLocalMongoose);

module.exports = mongoose.model('User', userSchema);
