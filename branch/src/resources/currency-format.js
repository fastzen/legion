import numeral from 'numeral';

export class CurrencyFormatValueConverter {
  toView(value) {
    return numeral(value).format('(0,0.00)');
  }
  fromView(value) {
    return value.replace(",", '');
  }
}
