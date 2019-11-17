const getListOfVehicles = () => {
  return {
    Economy: [
      ['Chevrolet', 'Spark'],
    ],
    Compact: [
      ['Nissan', 'Versa'],
      ['Honda', 'Fit'],
    ],
    'Mid-size': [
      ['Hyundai', 'Elentra'],
    ],
    Standard: [
      ['Volkswagen', 'Jetta'],
    ],
    'Full-size': [
      ['Chevrolet', 'Malibu'],
      ['Honda', 'Accord'],
    ],
    SUV: [
      ['Chevrolet', 'Equinox'],
    ],
    Truck: [
      ['Nissan', 'Frontier']
    ],

  };
}

module.exports = getListOfVehicles;
