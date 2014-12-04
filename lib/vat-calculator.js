'use strict';

var standardEuropeanVatRates = require('./standard-european-vat-rates');
var octobatMossService       = require('./octobat-moss-service');
var vatNumberValidator       = require('./vat-number-validator');
var q                        = require('q');

function VatRateCalculator(supplierCountry, supplierVatNumber, options) {
  if(!supplierCountry || !supplierVatNumber) {
    throw new Error('VatRateCalculator required parameters supplierCountry and supplierVatNumber');
  }

  supplierCountry = supplierCountry.toUpperCase();
  supplierVatNumber = supplierVatNumber.toUpperCase();

  if(!standardEuropeanVatRates(supplierCountry)) {
    throw new Error('Supplier country ' + supplierCountry + ' is not in the EU');
  }

  this.supplierCountry = supplierCountry;
  this.supplierVatNumber = supplierVatNumber;

  this.fallbackOnMossFailure = options && options.fallbackOnMossFailure || true;
  this.fallbackOnViesFailure = options && options.fallbackOnViesFailure || true;
}

VatRateCalculator.prototype.calculateVat = function(customerCountry, customerVatNumber, callback) {
  var self = this;
  return q.fcall(function() {
      if(!customerCountry) throw new Error('Customer country parameter is required');

      customerCountry = customerCountry.toUpperCase();

      // Rules taken from
      // http://docs.octobatvatmoss.apiary.io/reference/vat/vat-data/retrieve-vat-rate

      var customerCountryStandardRate = standardEuropeanVatRates(customerCountry);
      // If the supplier or the customer is located outside of EU, no EU-VAT is applicable.
      if(!customerCountryStandardRate) {
        return 0;
      }


      // If it's not 2015 yet, use the local VAT rate
      var now = self._getCurrentDate();
      if(now.getUTCFullYear() < 2015) {
        return standardEuropeanVatRates(self.supplierCountry);
      }

      // If the supplier is a business, with a valid VAT Number, we must analyse the
      // customer details to know if VAT is applicable.

      // If the customer is located in the same EU-Country than the supplier, the local
      // VAT rate is applicable, and VAT is due in their common country.
      customerCountry = customerCountry.toUpperCase();
      if(customerCountry === self.supplierCountry) {
        return customerCountryStandardRate;
      }

      // If the customer is located in another country, and is a business with valid VAT
      // number, the supplier must charge the customer with no VAT.
      if(customerVatNumber) {
        return self.calculateBusinessRate(customerCountry, customerVatNumber);
      }

      // If the customer is an individual, or a business with no VAT number, the supplier
      //  must charge VAT, at the customer's country rate, and VAT will be due in this country
      return customerCountryStandardRate;
    })
    .nodeify(callback);
};

VatRateCalculator.prototype.calculateBusinessRate = function(customerCountry, customerVatNumber) {
  var self = this;

  return octobatMossService({
      supplier: {
        country: this.supplierCountry,
        vatNumber: this.supplierVatNumber
      },
      customer: {
        country: customerCountry,
        vatNumber: customerVatNumber
      }
    })
    .then(function(result) {
      if(!result || typeof result.vat_rate !== 'number') throw new Error('Invalid response');
      // Prefer the MOSS services rate to our own
      return result.vat_rate;
    })
    .fail(function(err) {
      if(!self.fallbackOnMossFailure) throw err;

      return self.calculateBusinessRateNoOctobat(customerCountry, customerVatNumber);
    });
};


VatRateCalculator.prototype.calculateBusinessRateNoOctobat = function(customerCountry, customerVatNumber) {
  var self = this;
  return vatNumberValidator(customerCountry, customerVatNumber)
    .then(function(valid) {
      if(valid) {
        // VAT Number is valid. Rate is zero.
        return 0;
      }

      // VAT number is not valid. Use the standard rate for the customer's country
      return standardEuropeanVatRates(customerCountry);
    })
    .fail(function(err) {
      if(!self.fallbackOnViesFailure) throw err;

      // The customer has a VAT number, but we can't validate it.
      // Assume that it's real number
      return 0;
    });
};

/** Easier testing */
VatRateCalculator.prototype._getCurrentDate = function() {
  return new Date();
};

module.exports = VatRateCalculator;
