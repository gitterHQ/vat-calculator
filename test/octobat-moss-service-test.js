'use strict';

describe("octobat-moss-service", function() {

  var octobatMossService = require('../lib/octobat-moss-service');
  var assert = require('assert');

  var IBM_GB_VAT_NUMBER = "GB107328000";
  var ORACLE_GB_VAT_NUMBER = "GB391313073";
  var ORACLE_IE_VAT_NUMBER = " IE6556973V";

  it("should validate a valid VAT number across countries", function(done){
    this.timeout(10000);

    return octobatMossService({
        supplier: {
          country: 'GB',
          vatNumber: IBM_GB_VAT_NUMBER
        },
        customer: {
          country: 'IE',
          vatNumber: ORACLE_IE_VAT_NUMBER
        }
      })
      .then(function(result) {
        assert.strictEqual(result.vat_rate, 0);
      })

      .nodeify(done);
  });

  it("should validate a valid VAT number in one country", function(done){
    this.timeout(10000);

    return octobatMossService({
        supplier: {
          country: 'GB',
          vatNumber: IBM_GB_VAT_NUMBER
        },
        customer: {
          country: 'GB',
          vatNumber: ORACLE_GB_VAT_NUMBER
        }
      })
      .then(function(result) {
        assert.strictEqual(result.vat_rate, 20);
      })

      .nodeify(done);
  });

});
