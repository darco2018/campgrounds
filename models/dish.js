const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const dishSchema = new Schema({
  name: { type: String, required: true, trim: true },
  price: String,
  image: String,
  description: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  author: {
    // includes all info about author
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  foodplace: {
    type: Schema.Types.ObjectId,
    ref: 'Foodplace'
  },
  // includes only id - use this
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

// virtual for dish's URL - useful in tmeplates to get a particular instance of the model
dishSchema.virtual('url').get(function() {
  return '/dishes/' + this.id;
});

dishSchema
  .virtual('formattedCreatedAt')
  .get(() => moment(this.createdAt).format('DD/MM/YY'));

module.exports = mongoose.model('Dish', dishSchema);
