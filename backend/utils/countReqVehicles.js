// Desc: Groups reservations sequentially, such that each group can be
//       fulfilled by one vehicle.
// Param: Array of objects { fromDateTime: string, toDateTime: string, ... }
const scheduleReservations = reserves => {
  reserves.sort((a, b) => {
    return (new Date(a.toDateTime) > new Date(b.toDateTime)) ? 1 : -1;
  });
  const multipleVReserves = [];
  while (reserves.length > 0) {
    const singleVReserves = [reserves.shift()];
    while (true) {
      let prevRes = singleVReserves[singleVReserves.length -1];
      let nextResIndex;
      for (let i = 0; i < reserves.length; i++) {
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
  return multipleVReserves;
}

const countReqVehicles = reserves => {
  return scheduleReservations(reserves).length;
}

module.exports = countReqVehicles;
