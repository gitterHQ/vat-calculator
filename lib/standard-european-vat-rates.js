'use strict';

/* TODO: update this list from the internet? */
var RATES = {
  AT: 20,
  BE: 21,
  BG: 20,
  CY: 19,
  CZ: 21,
  DE: 19,
  DK: 25,
  EE: 20,
  GR: 23,
  ES: 21,
  FI: 24,
  FR: 20,
  HR: 25,
  HU: 27,
  IE: 23,
  IT: 22,
  LT: 21,
  LU: 17,
  LV: 21,
  MT: 18,
  NL: 21,
  PL: 23,
  PT: 23,
  RO: 24,
  SE: 25,
  SI: 22,
  SK: 20,
  GB: 20 // Not UK - it's UK in European Union literature only
};

module.exports = function standardEuropeanVatRate(countryCode) {
  return RATES[countryCode.toUpperCase()];
};
