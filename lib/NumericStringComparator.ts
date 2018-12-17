export default class {
  protected _collator: Intl.Collator;

  constructor() {
    this._collator = new Intl.Collator("de", { usage: "sort", numeric: true });
  }

  /**
   * Bound function to use in .sort(...)
   */
  public compare = (a?: string, b?: string): number => {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    //If a string contains a zero:
    if (a.indexOf("0") > -1 || b.indexOf("0") > -1) {
      const withoutZero = (_: string) => _.replace(/0+/g, "");
      const countZeros = (_: string) => (_.match(/0/g) || []).length;
      //check if strings without zeros are equal
      if (this._collator.compare(withoutZero(a), withoutZero(b)) == 0) {
        //and only compare number of zeros
        return countZeros(a) - countZeros(b);
      }
    }
    return this._collator.compare(a, b);
  };
}
