// Desc: Computes number of required vehicles to fulfill reservations
//       where all reservations are for a single vehicle type.
// Param: Array of objects { fromDateTime: string, toDateTime: string, ... }
const countReqVehicles = reserves => {
  reserves.sort((a, b) => {
    const a_toDateTime = new Date(a.toDateTime);
    const b_toDateTime = new Date(b.toDateTime);
    return (a_toDateTime > b_toDateTime) ? 1 : -1;
  });
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
