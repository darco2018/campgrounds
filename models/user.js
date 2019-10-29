const mongoose = require('mongoose');
const passwordLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: [true, 'User must have a password!'], trim: true }
});

userSchema.plugin(passwordLocalMongoose);

module.exports = mongoose.model('User', userSchema);
