'use strict';

var rest = require('restler-q');
var q = require('q');

module.exports = function(options) {
  return q.fcall(function() {
    if (!options) {
      throw new Error("options required");
    }

    var supplier = options.supplier;
    var customer = options.customer;

    if (!supplier || !customer) {
      throw new Error("options expects supplier and country");
    }

    if (!supplier.country || !supplier.vatNumber) {
      throw new Error("options.supplier expects country and vatNumber");
    }

    if (!customer.country) {
      throw new Error("options.customer expects country");
    }

    var eservice, transactionType;
    if(customer.vatNumber) {
      transactionType = "B2B";
    } else {
      transactionType = "B2C";
      eservice = options.eservice === undefined ? true :  options.eservice;
    }

    return rest.postJson('http://vatmoss.octobat.com/vat.json', {
        supplier: {
          country: supplier.country,
          vat_number: supplier.vatNumber || undefined
        },
        customer: {
          country: customer.country,
          vat_number: customer.vatNumber || undefined
        },
        transaction: {
          type: transactionType,
          eservice: eservice
        }
      });

  });
};
