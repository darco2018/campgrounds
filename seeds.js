/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Dish = require('./models/dish');
const comment = require('./models/comment');

const Comment = comment.commentModel;

const mockComments = [
  {
    text:
      'A great little park ( about 40 spaces ) which is very neat and well-kept. The staff is very friendly and each site was about 80 feet long. There is no cable. We dished at Gold Mountain RV Park in a Motorhome.',
    author: 'Mike'
  },
  {
    text:
      'This is our 3rd stay here. My 7/16 review gives a better description of the park. We again had a fairly level, FHU, pull through site that was satellite friendly. There is no cable or OTA TV. As others have noted, the Wi-Fi is very good. The lodge, bathrooms, and laundry are perfect for a small park like this one. While there is nothing recreational in the park, the reasonable nightly cost makes that negative acceptable.',
    author: 'thomas@friendly.com'
  },
  {
    text:
      'Excellent WiFi. No cable or over air reception, but WiFi good enough to stream via our Roku. Manager very friendly as was dish host. We dished at Gold Mountain RV Park in a Fifth Wheel.',
    author: 'Mike'
  }
];

const mockDishes = [
  {
    name: 'Wooden Paradise',
    image:
      'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description:
      'Our first class dishsites are unmatched in proximity to the lake and include water, electric (30/50 amp service), wireless internet and cable hook-ups, fire ring and picnic table. Whether you’re bringing a tent, travel trailer or a luxury motor home, you will find the perfect site.'
  },
  {
    name: 'Starry Night',
    image:
      'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description:
      'We don’t call this area the “middle of the park” for nothing - it’s centrally located to all of our amenities and is perfect for families with kids. With the best access to the pools, cafe, playground, and splash park, there are plenty of places to play and still be close to home. Guests looking for a little more quiet would be happier in the 700s, and satellite reception is best in the 900s and the odd-numbered 700s and 800s.'
  },
  {
    name: 'Meadow Mountains',
    image:
      'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    description:
      'It is an area with older growth pine trees, making them some of the prettier and more wooded sites at Cherry Hill Park. Tucked away in their own loop, they offer more privacy while still being an easy walk to the bus depot and main office. Folks looking for a shady site will be happy here.'
  }
];

let commentsCounter = 0;
function createDish(mockDish) {
  //
  Dish.create(mockDish, (err, savedDish) => {
    if (err) {
      console.log(`Error when saving dish: ${err}`);
    }
    console.log(`${savedDish.name} has been saved`);

    // create comment
    const newComment = mockComments[commentsCounter++];

    Comment.create(newComment, (error, savedComment) => {
      savedDish.comments.push(savedComment);

      savedDish.save((er, dish) => {
        if (er) console.log(`Error when saving dish: ${err}`);
      });
      console.log('Saved a comment');
    });
  });
}

function seedDb() {
  Dish.remove({}, err => {
    if (err) console.log(`Error when removing dishes: ${err}`);
    console.log('Removed dishes');

    /*  must be commented off when you change in comment model the author to: 
    author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
    
    Comment.remove({}, error => {
      if (err) console.log(`Error when removing comments: ${err}`);
      console.log('Removed comments');
      // re-create cmapgrounds
      // placed in callback: guarantee it will run AFTER remove
      console.log('Saving mock dishes..');
      mockDishes.forEach(dish => {
        createDish(dish);
      });
    }); */
  });
}

module.exports = seedDb;
