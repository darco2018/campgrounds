const mongoose = require('mongoose');

const foodplaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  lat: { type: Number, min: [0, "The latitude can't be negative!"] },
  lng: { type: Number, min: [0, "The longitude can't be negative!"] },
  formattedAddress: { type: String, trim: true },
  description: { type: String, trim: true },
  image: { type: String, trim: true },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  dishesCount: {
    type: Number,
    default: 0,
    min: [0, "The dish count can't be negative!"]
  },
  status: { type: String, enum: ['open', 'closed'] }
});

foodplaceSchema.virtual('cracowAddress').get(() => {
  return this.name + ' ' + this.address;
});

module.exports =  mongoose.model('Foodplace', foodplaceSchema);


