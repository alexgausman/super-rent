const Chance = require('chance');
const chance = new Chance();

const genExpDate = () => {
  let month = chance.integer({ min: 1, max: 12 }).toString();
  if (month.length === 1) {
    month = '0' + month;
  }
  let year = chance.integer({ min: 19, max: 22 }).toString();
  return month + year;
}

module.exports = genExpDate;
