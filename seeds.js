/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Dish = require('./models/dish');
const foodplace = require('./models/foodplace');
const Foodplace = foodplace.foodplaceModel;
const comment = require('./models/comment');
const Comment = comment.commentModel;

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

    for (const seed of mockDishes) {
      let savedDish = await Dish.create(seed);
      console.log('Saved a dish');
    }
  } catch (error) {
    console.log(error);
  }
}

const mockDishes = [
  {
    _id: '5d999dbd4029930fa9e8ebd3',
    foodplace: '5d9a35b6711f957454e97906',
    comments: [
      '5d99a2804029930fa9e8ebdb',
      '5d99a3194029930fa9e8ebe3',
      '5d99a3764029930fa9e8ebe6',
      '5d9df4bb7727062738ef4abb'
    ],
    name: 'Spaghetti Bolognese',
    price: '32',
    image:
      'https://images.unsplash.com/photo-1553842305-95ade71145ff?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description:
      'Dawno już nie jadłam takiego spaghetti. Sos musiał robić jakiś włoski mistrz. Te amet wisi quodsi cum, mea te quis luptatum contentiones, eu has ponderum senserit. Et corrumpit incorrupte assueverit his, ius lorem viris ad. Dicat ancillae pri at, vitae possit semper ius ut. Sed ne omnes aliquip.',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'q'
    },
    createdAt: '2019-08-09T10:40:31.418+0000'
  },
  {
    _id: '5d999ede4029930fa9e8ebd4',
    foodplace: '5d9a00f2b52e244adecf548e',
    comments: [
      '5d99a2ab4029930fa9e8ebdd',
      '5d99a3324029930fa9e8ebe4',
      '5d99a3964029930fa9e8ebe7',
      '5d9cf2155ce3ed3c6f78261c'
    ],
    name: 'Pizza z Rukolą',
    price: '15',
    image:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description:
      'Ciasto przedniej jakości. Pomidory widać, że świeże i soczyste niczym włoskie. Rukola tez prosto z doniczki. Te amet wisi quodsi cum, mea te quis luptatum contentiones, eu has ponderum senserit. Et corrumpit incorrupte assueverit his, ius lorem viris ad. Dicat ancillae pri at, vitae possit semper ius ut. Sed ne omnes aliquip.',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'q'
    },
    createdAt: '2019-10-15T19:20:24.418+0000'
  },
  {
    _id: '5d9cf0115ce3ed3c6f782618',
    comments: [],
    foodplace: '5d99f7e8b52e244adecf548b',
    name: 'Chips',
    price: '8',
    image:
      'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description:
      'Gatunek ziemniaków robi różnicę. Tu widać był gorszy sort, albo olej sprzed wieku ... Vis mazim option epicuri ad. Augue moderatius vis at. Id fastidii ocurreret assentior eos, adversarium neglegentur et nec. Vix quas dissentiet ad. His te congue aperiri eripuit, modus admodum et ius, sed nonumes senserit et. Nisl mucius mei no.',
    author: {
      id: '5d99a0c94029930fa9e8ebd8',
      username: 'z'
    },
    createdAt: '2019-10-12T20:07:53.418+0000'
  },
  {
    _id: '5d999fc24029930fa9e8ebd6',
    foodplace: '5d99f7e8b52e244adecf548b',
    comments: ['5d99a2d14029930fa9e8ebdf', '5d99a34e4029930fa9e8ebe5'],
    name: 'Hamburger',
    price: '5.50',
    image:
      'https://images.unsplash.com/photo-1561758033-d89a9ad46330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description:
      'Mięsko bardzo soczyste. Można okreslić jak bardzo zrobione sobie życzymy. Cena tez spoko. Sed dolores appetere platonem cu, assueverit dissentiunt no quo, mei te eros ridens eirmod. Nam vero dissentiunt eu. Ad nam tollit appareat, vim ex numquam omnesque. Nam amet saepe at, impedit propriae delectus te nam, in sea veri utinam repudiare. Duo nihil melius cu, movet hendrerit voluptatum nec eu. Duo adhuc dissentiunt vituperatoribus in. His cu malis nonumy aliquando, falli sensibus eos ea.  <p>Vis mazim option epicuri ad. Augue moderatius vis at. Id fastidii ocurreret assentior eos, adversarium neglegentur et nec. Vix quas dissentiet ad. His te congue aperiri eripuit, modus admodum et ius, sed nonumes senserit et. Nisl mucius mei no.</p>  <p>Sonet tacimates his in, sit legere consulatu intellegebat an, dicam consetetur moderatius nec ut. Vis eius utinam moderatius.</p>',
    author: {
      id: '5d999f8a4029930fa9e8ebd5',
      username: 'a'
    },
    createdAt: '2019-10-09T10:00:01.418+0000'
  },
  {
    _id: '5d99a0b04029930fa9e8ebd7',
    foodplace: '5d9a121e98605561e139e858',
    comments: ['5d99a2ee4029930fa9e8ebe1', '5d99a3b24029930fa9e8ebe8'],
    name: 'Umba-Umba Salad',
    price: '8.25',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description:
      'Warzywa świeżutkie i pieknie podane, co widac na zdjęciu. Niestety cena zwala z nóg. Augue moderatius vis at. Id fastidii ocurreret assentior eos, adversarium neglegentur et nec. Vix quas dissentiet ad. His te congue aperiri eripuit, modus admodum et ius, sed nonumes senserit et. Nisl mucius mei no.',
    author: {
      id: '5d999f8a4029930fa9e8ebd5',
      username: 'a'
    },
    createdAt: '2019-10-03T07:44:53.418+0000'
  },
  {
    _id: '5d9a37b098558d76286dab3e',
    foodplace: '5d9b6c0fa8959c67e3e41bcf',
    comments: [],
    name: 'Jajecznica na Bogato z Dodatkami',
    price: '12.5',
    image:
      'https://images.unsplash.com/photo-1552611052-60b2c00a2be8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=926&q=80',
    description:
      'Boczku niedużo, ale za to te dodatki warte są swojej ceny! Przyjdę znowu! Te amet wisi quodsi cum, mea te quis luptatum contentiones, eu has ponderum senserit. Et corrumpit incorrupte assueverit his, ius lorem viris ad. Dicat ancillae pri at, vitae possit semper ius ut. Sed ne omnes aliquip.',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'q'
    },
    createdAt: '2019-09-29T10:10:33.418+0000'
  },
  {
    _id: '5d99a11e4029930fa9e8ebd9',
    foodplace: '5d99f91fb52e244adecf548d',
    comments: ['5d99a3c34029930fa9e8ebe9'],
    name: 'Pumkin Soup',
    price: '7.40',
    image:
      'https://images.unsplash.com/photo-1530734575165-ce39d996fbaa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80',
    description:
      'Polecam! Ostatni raz taka dobrą zupę jadlam u babci 10 lat temu. Cena do przyjęcia. Sed dolores appetere platonem cu, assueverit dissentiunt no quo, mei te eros ridens eirmod. Nam vero dissentiunt eu. Ad nam tollit appareat, vim ex numquam omnesque. Nam amet saepe at, impedit propriae delectus te nam, in sea veri utinam repudiare. Duo nihil melius cu, movet hendrerit voluptatum nec eu. Duo adhuc dissentiunt vituperatoribus in. His cu malis nonumy aliquando, falli sensibus eos ea.  Vis mazim option epicuri ad. Augue moderatius vis at. Id fastidii ocurreret assentior eos, adversarium neglegentur et nec. Vix quas dissentiet ad. His te congue aperiri eripuit, modus admodum et ius, sed nonumes senserit et. Nisl mucius mei no.  Sonet tacimates his in, sit legere consulatu intellegebat an, dicam consetetur moderatius nec ut. Vis eius utinam moderatius.',
    author: {
      id: '5d99a0c94029930fa9e8ebd8',
      username: 'z'
    },
    createdAt: '2019-09-09T03:45:11.418+0000'
  },
  {
    _id: '5d9dad422e901056a4080ef9',
    comments: [],
    foodplace: '5d99f8f0b52e244adecf548c',
    name: 'Giant Shrimps ',
    price: '68',
    image:
      'https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description: 'They were really huge.',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'q'
    },
    createdAt: '2019-08-09T10:52:15.418+0000'
  },
  {
    _id: '5d9dc87d0402d6642e1fb97c',
    comments: [],
    foodplace: '5d9ed875a3e2873531b7bbee',
    name: 'Ciastko z Truskawkami',
    price: '2',
    image:
      'https://images.unsplash.com/photo-1464219551459-ac14ae01fbe0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
    description:
      'Dobre, ale tuczące - jak wszystko co dobre niestety. Cena mogłaby być niższa. Te amet wisi quodsi cum, mea te quis luptatum contentiones, eu has ponderum senserit. Et corrumpit incorrupte assueverit his, ius lorem viris ad. Dicat ancillae pri at, vitae possit semper ius ut. Sed ne omnes aliquip.',
    author: {
      id: '5d999c195040be0ad32d5c38',
      username: 'q'
    },
    createdAt: '2019-08-01T11:30:00.418+0000'
  }
];

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
    description:
      'Wybraliśmy to miejsce, by świętować naszą rocznicę. Bardzo smaczne jedzenie, obsługa dyskretna i pomocna, a klimat warty wszytkiego!',
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
    description:
      'Zdecydowanie moja najbardziej ulubiona z tutejszych restauracji. Na uroczystą kolację w sam raz. Znakomita obsługa, jeszcze lepsze menu. Porcje niemałe, a potrawy bardzo dopracowane, na bardzo wysokim poziomie',
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
    description:
      'Minęły już 3 miesiące od naszej stypy, a ludzie wciąż je zachwalają i wspominają. My sami pamiętamy ten dzień z radością, co jest dużą zasługą Pana Wojtka, którzy świetnie nas ugościli i pomogli uczynić to przyjęcie niezapomnianym. Obsługa przemiła, jedzenie przepyszne ',
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
    description:
      'Cudne miejsce!!! Bajeczne jedzenie, muzyka na żywo i wybitne wina. Desery są prawdziwą ambrozją!!! Lokal ma ciekawą, ciepłą atmosferę.',
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
    description:
      'Wyraziste smaki. Małe, ale przytulne miejsce, obsługa na wysokim poziomie. Pełna kultura i życzliwość. Wrócę na pewno ',
    image:
      'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80',
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
    description:
      'Niezobowiązująca atmosfera, idealna na spotkanie ze znajomymi (bywam tam w miarę możliwości), Do skosztowania polecam gulasz i grzyby – super!',
    image:
      'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80',
    lat: 50.07093,
    lng: 19.92195
  }
];

module.exports = seedDb;
