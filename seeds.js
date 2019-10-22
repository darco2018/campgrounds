/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Dish = require('./models/dish');
const foodplace = require('./models/foodplace');
const Foodplace = foodplace.foodplaceModel;
const comment = require('./models/comment');
const Comment = comment.commentModel;

const mockFoodplaces = [
  {
    _id: '5d99f7e8b52e244adecf548b',
    name: 'McRonald',
    address: 'Czysta 5',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'q'
    },
    description:
      'Obsługa na dorbym poziomie. Potrawy bardzo dobre, prawdziwa rozkosz dla podniebienia. Atmosfera wnętrza zwielokrotnia przyjemne doznania.',
    image:
      'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    lat: 50.06399,
    lng: 19.92692
  },
  {
    _id: '5d99f8f0b52e244adecf548c',
    name: "Harry's Bar",
    address: 'Grodzka 8',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'q'
    },
    description:'Wybraliśmy to miejsce, by świętować naszą rocznicę. Bardzo smaczne jedzenie, obsługa dyskretna i pomocna, a klimat warty wszytkiego!',
    image:
      'https://images.unsplash.com/photo-1556745750-68295fefafc5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80',
    lat: 50.05973,
    lng: 19.93785
  },
  {
    _id: '5d99f91fb52e244adecf548d',
    name: 'U Chińczyka',
    address: 'Szewska 12',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'a'
    },
    description:
      'Obsługa na dorbym poziomie. Potrawy bardzo dobre, prawdziwa rozkosz dla podniebienia. Atmosfera wnętrza zwielokrotnia przyjemne doznania.',
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    lat: 50.06251,
    lng: 19.93457
  },
  {
    _id: '5d9a00f2b52e244adecf548e',
    name: 'Pizza Cult',
    address: 'Bronowicka 30',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'a'
    },
    description: 'Zdecydowanie moja najbardziej ulubiona z tutejszych restauracji. Na uroczystą kolację w sam raz. Znakomita obsługa, jeszcze lepsze menu. Porcje niemałe, a potrawy bardzo dopracowane, na bardzo wysokim poziomie',
    image:
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80',
    lat: 50.0777912,
    lng: 19.9005365
  },
  {
    _id: '5d9a121e98605561e139e858',
    name: 'Fish Club',
    address: 'Dobrego Pasterza 24',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'a'
    },
    description:'Minęły już 3 miesiące od naszej stypy, a ludzie wciąż je zachwalają i wspominają. My sami pamiętamy ten dzień z radością, co jest dużą zasługą Pana Wojtka, którzy świetnie nas ugościli i pomogli uczynić to przyjęcie niezapomnianym. Obsługa przemiła, jedzenie przepyszne ',
    image:
      'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    lat: 50.08766,
    lng: 19.96083
  },
  {
    _id: '5d9a35b6711f957454e97906',
    name: 'Gruba Mysz',
    address: 'Limanowskiego 20',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'z'
    },
    description:'Cudne miejsce!!! Bajeczne jedzenie, muzyka na żywo i wybitne wina. Desery są prawdziwą ambrozją!!! Lokal ma ciekawą, ciepłą atmosferę.',
    image:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80',
    lat: 50.04491,
    lng: 19.95338
  },
  {
    _id: '5d9b6c0fa8959c67e3e41bcf',
    name: 'Cuda u Marysi',
    address: 'Wielicka 34',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'z'
    },
    description: 'Wyraziste smaki. Małe, ale przytulne miejsce, obsługa na wysokim poziomie. Pełna kultura i życzliwość. Wrócę na pewno ',
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    lat: 50.03939,
    lng: 19.96509
  },
  {
    _id: '5d9ed875a3e2873531b7bbee',
    name: 'Jama Smoka',
    address: 'Królewska 22',
    city: 'Kraków',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'z'
    },
    description:'Niezobowiązująca atmosfera, idealna na spotkanie ze znajomymi (bywam tam w miarę możliwości), Do skosztowania polecam gulasz i grzyby – super!',
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80',
    lat: 50.07093,
    lng: 19.92195
  }
];

async function seedDb() {
  try {
    await Dish.deleteMany({});
    await Comment.deleteMany({});
    await Foodplace.deleteMany({});
    console.log('Removed dishes, comments, foodplaces.');

    for (const seed of mockFoodplaces) {
      let savedFoodplace = await Foodplace.create(seed);
      console.log('Saved a foodplace');
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = seedDb;
