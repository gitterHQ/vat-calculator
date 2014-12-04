'use strict';

describe("vat-number-validator", function() {

  var vatNumberValidator = require('../lib/vat-number-validator');

  var assert = require('assert');

  var IBM_GB_VAT_NUMBER = "107328000";
  var ORACLE_GB_VAT_NUMBER = "GB391313073";

  it("should validate a valid VAT number without country prefix", function(done){
    return vatNumberValidator("GB", IBM_GB_VAT_NUMBER)
      .then(function(result) {
        assert.strictEqual(result, true);
      })
      .nodeify(done);
  });

  it("should validate a valid VAT number with country prefix", function(done){
    return vatNumberValidator("GB", ORACLE_GB_VAT_NUMBER)
      .then(function(result) {
        assert.strictEqual(result, true);
      })
      .nodeify(done);
  });

  it("should not validate an invalid VAT number", function(done){
    return vatNumberValidator("GB", "000111000111000111")
      .then(function(result) {
        assert.strictEqual(result, false);
      })
      .nodeify(done);
  });

});
