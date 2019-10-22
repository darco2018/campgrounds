/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Dish = require('./models/dish');
const foodplace = require('./models/foodplace');
const Foodplace = foodplace.foodplaceModel;
const comment = require('./models/comment');
const Comment = comment.commentModel;


const mockComments = [
  {
    text: 'Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Ultrices dui sapien eget mi proin. Turpis massa sed elementum tempus egestas sed sed risus pretium. Ultrices sagittis orci a scelerisque purus semper eget duis.',
    author: 'q'
  },
  {
    text: 'Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Ultrices dui sapien eget mi proin. Turpis massa sed elementum tempus egestas sed sed risus pretium. Ultrices sagittis orci a scelerisque purus semper eget duis.',
    author: 'q'
  },
  {
    text: 'Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Ultrices dui sapien eget mi proin. Turpis massa sed elementum tempus egestas sed sed risus pretium. Ultrices sagittis orci a scelerisque purus semper eget duis.',
    author: 'q'
  }
];

const mockDishes = [
  {
    name: 'Spaghetticoaster',
    image: 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=634&q=80',
    description: 'This is an easy and quick meal we can fix to give him that energy boost and to keep his hunger satisfied. I really can\'t tell. A difference between a name brand spaghetti and the Great Value brand!'
  },
  {
    name: 'Steak Delight',
    image:'https://images.unsplash.com/photo-1565299715199-866c917206bb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=714&q=80',
    description: ' It\'s rare these days for me to encounter a dish I\'ve never seen. At Steak & Grapes, I saw not just one, but a whole handful.'
  },
  {
    name: 'Burger Heaven',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description: 'The burgers are good, but not sure how they differentiate themselves from Mac Donalds. The varieties are similar and the price range is identical.'
  }
];

async function seedDb(){

  try {
    await Dish.deleteMany({});
    await Comment.deleteMany({});
    await Foodplace.deleteMany({})
    console.log("Removed dishes, comments, foodplaces.");
  
    for( const seed of mockDishes){
      let savedDish = await Dish.create(seed);
      console.log("Dish created");
  
      let savedComment = await Comment.create(
        {
          text: 'This place is great, but I wish there were more choices',
          author: 'q'
        }
      )    
      console.log("Comment created");
      
      savedDish.comments.push(savedComment);
      savedDish.save();
      console.log("Comment added to dish");    
    }
    
  } catch (error) {
    console.log(error);
  }
  
}
/* 

PREVIOUS VERSION

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

  });
}
 */
module.exports = seedDb;
