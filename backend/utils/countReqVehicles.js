// Desc: Computes number of required vehicles to fulfill reservations
//       where all reservations are for a single vehicle type.
// Param: Array of objects { fromDateTime: string, toDateTime: string, ... }
//        ordered by ascending toDateTime
const countReqVehicles = reserves => {
  const multipleVReserves = [];
  while (reserves.length > 0) {
    const singleVReserves = [reserves.shift()];
    while (true) {
      let prevRes = singleVReserves[singleVReserves.length -1];
      let nextResIndex;
      for(let i = 0; i < reserves.length; i++) {
        const reserve = reserves[i];
        if (new Date(reserve.fromDateTime) >= new Date(prevRes.toDateTime)) {
          nextResIndex = i;
          break;
        }
      }
      if (nextResIndex) {
        const nextRes = reserves.splice(nextResIndex, 1)
        singleVReserves.push(nextRes[0]);
      } else {
        break;
      }
    }
    multipleVReserves.push(singleVReserves);
  }
  return multipleVReserves.length;
}

module.exports = countReqVehicles;
