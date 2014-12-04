'use strict';

var validate = require('validate-vat');
var q = require('q');

module.exports = function vatNumberValidator(countryCode, vatNumber) {
  var d = q.defer();

  // Remove the "GB" from the VAT number
  if(vatNumber.indexOf(countryCode) === 0) {
    vatNumber = vatNumber.substring(countryCode.length);
  }

  validate(countryCode, vatNumber, function(err, validationInfo) {
    if(err) return d.reject(err);

    d.resolve(validationInfo.valid);
  });

  return d.promise;
};
