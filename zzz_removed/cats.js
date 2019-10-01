/* eslint-disable no-use-before-define */
/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const dbName = 'db_example';
let Kitten;

// ---------- RUNS on app startup as this router is added to app.js -------------

// create connection ------------------------------
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
// -------------- end connection ------------------

db.once('open', () => {
  console.log("-------------------We're connected!!!--------------------");
  console.log(process.env.HOME);
  createKittenModel();
});

// -----------------------------

// ROUTE
// gets called when request for /cats
router.get('/', (req, res) => {
  console.log('GET /cats ');
  const animal1 = createCat('Tisia');
  const animal2 = createCat('Gucio');

  addToDbWithSave(animal1);
  addToDbWithCreate(animal2);
  showAllKittens();

  res.send('Cats ok.');
});

function createKittenModel() {
  const kittySchema = new mongoose.Schema({
    name: String,
    age: Number,
  });

  // WARNING: adding a method. methods must be added before schema compilation!
  // arrow function will change 'this' to mean window(global context)
  kittySchema.methods.speak = function () {
    console.log(this.name);
    const greeting = this.name
      ? `My name is ${this.name}`
      : "I don't have a name";
    console.log(`The cat says ${greeting}`);
  };

  // COMPILE schema into a Model (a class to construct documents with)
  Kitten = mongoose.model('Kitten', kittySchema); // creates collection db.kittens
}

function createCat(catsName) {
  const cat = new Kitten({ name: catsName }); // create an instance, ie kitten document Kitten is the mongoose-compiled model
  console.log(`Created cat object: ${cat.name}`);
  cat.speak();
  return cat;
}

function addToDbWithSave(cat) {
  // SAVE TO DB
  cat.save((err, savedCat) => {
    // savedCat refers to what came out of the db
    if (err) {
      return console.log(`Error is: ${err}`);
    }
    console.log(`${savedCat} has been saved to db`);
  });
}

function addToDbWithCreate(cat) {
  // SAVE TO DB      // db.kittens.drop() to clear collection

  Kitten.create(
    cat, // or { name: 'Georgini' },
    (err, savedCat) => {
      if (err) {
        return console.log(err);
      }
      console.log(`${savedCat} has been saved`);
    },
  );
}

function showAllKittens() {
  // FIND/CREATE/REMOVE called on model Kitten
  Kitten.find((err, cats) => {
    // cats is whats returen from db
    if (err) {
      return console.log(`Error is: ${err}`);
    }
    console.log('Showing the kittens: \n');
    console.log(cats);
  });
}

//-------------------------
/*
const catSchema = new mongoose.Schema({
  name: String,
});
// ADD METHOD
catSchema.methods.speak = function () {
  // arrow function looks for the value in the lexical scope (here it happens
  to be th eglobal object)
  // regular function: 'this' is bound to the new object created when you instantiate the new Kitten
  console.log(`>>>>>>>>>>Value od this is ${this}`); // { _id: 5d8a5c81f9b8b762d94e8f05,
  name: 'fluffy' }
  const greeting = this.name
    ? `Meow name is ${this.name}`
    : "I don't have a name";
  console.log(greeting);
};

const Kot = mongoose.model('Kot', catSchema);

const fluffy = new Kot({ name: 'fluffy' });
fluffy.speak(); // "Meow name is fluffy"
 */
//---------------

module.exports = router;
