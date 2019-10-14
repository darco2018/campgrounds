exports.processStreetName = function(address) {
  const regex = /(\bulica \b|\bul? \b)|\bul\.(\b| )/i;
  return address.replace(new RegExp(regex), '').trim();
};
