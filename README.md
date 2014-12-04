# vat-calculator

Calculate European VAT rates. Designed to deal with the MOSS directive after 1 January 2015. For dates prior to that, will use current VAT rules.

```shell
npm install vat-calculator
```

### Limitations

* Only deals with standard rate VAT.
* VAT rates are currently hard-coded.
* This library only deals with European based suppliers registered for VAT.

### Services Used

* [Octobat's MOSS Service](https://www.octobat.com/2015-eu-vat-invoices)
* [VIES VAT Number Validation](http://ec.europa.eu/taxation_customs/vies/)
* The library has logic to deal with both of these services failing. We don't like turning customers away just because a downstream service is not available!

### Logic

* Before 1 January 2015, the library will return the supplier's local VAT rate for European customers, and zero VAT rate for international customers.
* After 1 January 2015, the library will use the MOSS rules.
* If the customer's VAT number needs to be validated, the Octobat service is used. It also uses the VAT rate from Octobat, rather than the ones hardcoded into the service.
* If Octobat fails, the service will failover to using the VIES service, but the VAT rate used will be the local, hardcoded rate for the customer's country.
* If VIES also fails and the customer has a VAT number we presume that it is valid. 


### Usage

```javascript
var VatCalculator = require('vat-calculator');

/* Initialise the library using the suppliers VAT country and number */
var vatCalc = new VatCalculator("GB", "GB107328000");

/* Supports callbacks */
vatCalc.calculateVat("IE", "", function(err, vatRate) {
  // vatRate -> 20 before 1 Jan 2015, 23 after
});

vatCalc.calculateVat("GB", "GB1234567", function(err, vatRate) {
  // vatRate -> 20 before and after 1 Jan 2015
});

/* Also supports promises */
vatCalc.calculateVat("US", "")
	.then(function(vatRate) {
    // vatRate -> 0 before and after 1 Jan 2015
  });

/* Will validate against Octobar or VIES if available
/* Invalid VAT number */
vatCalc.calculateVat("IE", "0000000000000", function(err, vatRate) {
  // vatRate -> 20 before 1 Jan 2015, 23 after
});

/* Valid VAT number */
vatCalc.calculateVat("IE", "IE6556973V", function(err, vatRate) {
  // vatRate -> 20 before 1 Jan 2015, 0 after
});

```
