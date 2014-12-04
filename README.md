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
/* Pass in the customer's country and VAT number */
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

/* Will validate against Octobat or VIES if available
/* Invalid VAT number */
vatCalc.calculateVat("IE", "0000000000000", function(err, vatRate) {
  // vatRate -> 20 before 1 Jan 2015, 23 after
});

/* Valid VAT number */
vatCalc.calculateVat("IE", "IE6556973V", function(err, vatRate) {
  // vatRate -> 20 before 1 Jan 2015, 0 after
});

```

# License
The MIT License (MIT)

Copyright (c) 2014, Andrew Newdigate

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
