const utils = require('./public/javascripts/utilities/utils');
utils.processStreetName('ulica Marka');
console.log(utils.processStreetName('ulica Marka'));
console.log(utils.processStreetName('ul Marka'));
console.log(utils.processStreetName('ul. Marka'));
console.log(utils.processStreetName('ul.Marka'));
console.log(utils.processStreetName('Ulica Marka'));
console.log(utils.processStreetName(' ulica Marka'));
console.log(utils.processStreetName(' ul. Marka'));
console.log(utils.processStreetName(' ul Marka'));
console.log(utils.processStreetName('makul'));
console.log(utils.processStreetName('makulica'));
console.log(utils.processStreetName('makul.'));


