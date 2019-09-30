// eslint-disable-next-line no-unused-vars
const mongoose = require('mongoose');
const Campground = require('./models/campground');

const mockCampgrounds = [
  {
    name: 'Camp1',
    image:
      'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description: 'Nicely situated. Clean',
  },
  {
    name: 'Camp2',
    image:
      'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description: 'No dogs allowed. dirty.',
  },
  {
    name: 'Camp3',
    image:
      'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description: 'Far from the beach. noisy',
  },
];

function createCampground(camp) {
  Campground.create(camp, (err, savedCamp) => {
    if (err) {
      return console.log.bind(console, err)(`Error is: ${err}`);
    }
    console.log(`${savedCamp} has been saved`);
  });
}

function seedDb() {
  Campground.remove({}, (err) => {
    if (err) {
      return console.log.bind(console, err)(
        `Error when removing items from campgrounds: ${err}`,
      );
    }
    console.log('Removed campgrounds');
    // placed in callback: guarantee it will run AFTER remove
    mockCampgrounds.forEach((item) => {
      createCampground(item);
    });
    console.log('Saved mock campgrounds');
  });
}

module.exports = seedDb;
