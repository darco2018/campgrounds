const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const foodplaceSchema = new Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  lat: { type: Number, min: [0, "The latitude can't be negative!"] },
  lng: { type: Number, min: [0, "The longitude can't be negative!"] },
  fullAddress: { type: String, trim: true },
  description: { type: String, trim: true },
  image: { type: String, trim: true },
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  dishesCount: {
    type: Number,
    default: 0,
    min: [0, "The dish count can't be negative!"]
  },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

foodplaceSchema.virtual('shortAddress').get(function() {
  return this.address + ', ' + this.city;
});

foodplaceSchema.virtual('longAddress').get(function() {
  let address = this.fullAddress.replace(', Polska', '');
  return address;
});

foodplaceSchema.virtual('url').get(() => '/foodplace/' + this.id);

// <a href=<%= val.url%> id="<% val.name %>"> if(val.status=='closed')Closed</a>

foodplaceSchema
  .virtual('dateCreatedFormatted')
  .get(() => moment(this.createdAt).format('MMMM Do, YY'));

module.exports = mongoose.model('Foodplace', foodplaceSchema);
