/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const comment = require('./models/comment');

const Comment = comment.commentModel;

const mockComments = [
  {
    text: 'It was horrible. Very dirty - I hated it.',
    author: 'Mike'
  },
  {
    text: "It was absoultely fantastic. I'd like to go back there again.",
    author: 'Thomas'
  },
  {
    text: 'Best pace in the world, Friendly stuff & clean toilets.',
    author: 'Mike'
  }
];

const mockCampgrounds = [
  {
    name: 'Camp1',
    image:
      'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description: 'Nicely situated. Clean'
  },
  {
    name: 'Camp2',
    image:
      'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description: 'No dogs allowed. dirty.'
  },
  {
    name: 'Camp3',
    image:
      'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description: 'Far from the beach. noisy'
  }
];

let commentsCounter = 0;
function createCampground(mockCamp) {
  //
  Campground.create(mockCamp, (err, savedCamp) => {
    if (err) {
      console.log(`Error when saving campground: ${err}`);
    }
    console.log(`${savedCamp.name} has been saved`);

    // create comment
    const newComment = mockComments[commentsCounter++];

    Comment.create(newComment, (error, savedComment) => {
      savedCamp.comments.push(savedComment);

      savedCamp.save((er, campground) => {
        if (er) console.log(`Error when saving campground: ${err}`);
      });
      console.log('Saved a comment');
    });
  });
}

function seedDb() {
  Campground.remove({}, err => {
    if (err) console.log(`Error when removing campgrounds: ${err}`);
    console.log('Removed campgrounds');

    Comment.remove({}, error => {
      if (err) console.log(`Error when removing comments: ${err}`);
      console.log('Removed comments');
      // re-create cmapgrounds
      // placed in callback: guarantee it will run AFTER remove
      console.log('Saving mock campgrounds..');
      mockCampgrounds.forEach(camp => {
        createCampground(camp);
      });
    });
  });
}

module.exports = seedDb;
