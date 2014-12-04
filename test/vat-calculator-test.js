'use strict';

describe("vat-calculator", function() {

  var assert = require('assert');
  var rewire = require('rewire');
  var q = require('q');

  var IBM_GB_VAT_NUMBER = "GB107328000";
  var ORACLE_IE_VAT_NUMBER = "IE6556973V";
  var GB_VAT_RATE = 20;
  var IE_VAT_RATE = 23;

  describe("dates before 1 jan 2015", function() {
    before(function() {
      this.VatCalculator = rewire('../lib/vat-calculator');
      this.vatCalculator = new this.VatCalculator("GB", IBM_GB_VAT_NUMBER);
      this.vatCalculator._getCurrentDate = function() {
        return new Date("3 December 2014");
      };
    });

    it('should use the local VAT rate for EU countries', function(done) {
      this.vatCalculator.calculateVat("IE")
        .then(function(result) {
          assert.strictEqual(result, GB_VAT_RATE);
        })
        .nodeify(done);
    });

    it('should use the local VAT rate for local customers', function(done) {
      this.vatCalculator.calculateVat("GB")
        .then(function(result) {
          assert.strictEqual(result, GB_VAT_RATE);
        })
        .nodeify(done);
    });

    it('should use no VAT for intl customers', function(done) {
      this.vatCalculator.calculateVat("US")
        .then(function(result) {
          assert.strictEqual(result, 0);
        })
        .nodeify(done);
    });
  });

  describe("dates after 1 jan 2015", function() {
    beforeEach(function() {
      this.VatCalculator = rewire('../lib/vat-calculator');
      this.vatCalculator = new this.VatCalculator("GB", IBM_GB_VAT_NUMBER);
      this.vatCalculator._getCurrentDate = function() {
        return new Date("3 January 2015");
      };
    });

    it("should handle local customers correctly", function(done) {
      this.vatCalculator.calculateVat("GB", "anything")
        .then(function(result) {
          assert.strictEqual(result, GB_VAT_RATE);
        })
        .nodeify(done);
    });


    it("should handle customers with a VAT number correctly", function(done) {
      this.VatCalculator.__set__("octobatMossService", function() { return q.resolve({ vat_rate: 99 }); });
      this.VatCalculator.__set__("vatNumberValidator", function() { return q.reject(new Error()); });

      this.vatCalculator.calculateVat("IE", "anything")
        .then(function(result) {
          assert.strictEqual(result, 99);
        })
        .nodeify(done);
    });

    it("should handle customers without a VAT number correctly", function(done) {
      this.VatCalculator.__set__("octobatMossService", function() { return q.resolve({ vat_rate: 99 }); });
      this.VatCalculator.__set__("vatNumberValidator", function() { return q.reject(new Error()); });

      this.vatCalculator.calculateVat("IE", "")
        .then(function(result) {
          assert.strictEqual(result, IE_VAT_RATE);
        })
        .nodeify(done);
    });

    describe("dealing with moss failures", function() {
      it('should fall back to vat validation', function(done) {
        this.VatCalculator.__set__("octobatMossService", function() { return q.reject(new Error('Failed')); });
        this.VatCalculator.__set__("vatNumberValidator", function() { return q.resolve(true); });

        this.vatCalculator.calculateVat("IE", ORACLE_IE_VAT_NUMBER)
          .then(function(result) {
            assert.strictEqual(result, 0);
          })
          .nodeify(done);
      });

      it('should fall back to vat validation', function(done) {
        this.VatCalculator.__set__("octobatMossService", function() { return q.reject(new Error('Failed')); });
        this.VatCalculator.__set__("vatNumberValidator", function() { return q.resolve(false); });

        this.vatCalculator.calculateVat("IE", ORACLE_IE_VAT_NUMBER)
          .then(function(result) {
            assert.strictEqual(result, IE_VAT_RATE);
          })
          .nodeify(done);
      });
    });

    describe("dealing with vies failures", function() {
      it('should fall back to vat validation', function(done) {
        this.VatCalculator.__set__("octobatMossService", function() { return q.reject(new Error('Failed')); });
        this.VatCalculator.__set__("vatNumberValidator", function() { return q.reject(new Error('Failed')); });

        this.vatCalculator.calculateVat("IE", ORACLE_IE_VAT_NUMBER)
          .then(function(result) {
            assert.strictEqual(result, 0);
          })
          .nodeify(done);
      });

    });

  });



});
