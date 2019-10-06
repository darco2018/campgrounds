const mongoose = require('mongoose');

const foodplaceSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String
});

const foodplaceModel = mongoose.model('Foodplace', foodplaceSchema);

module.exports = {
  foodplaceSchema,
  foodplaceModel
};
