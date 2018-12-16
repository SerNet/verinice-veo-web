import test, { ExecutionContext } from "ava";
import Comparator from "~/lib/NumericStringComparator";

const comparator = new Comparator().compare;

const compare = (t: ExecutionContext, a: string, b: string, expected: number) => {
  if (expected == -1) {
    t.truthy(comparator(a, b) < 0);
  } else if (expected == 1) {
    t.truthy(comparator(a, b) > 0);
  } else {
    t.truthy(comparator(a, b) == 0);
  }
};

let i = 0;

test("German Umlaut O: 1", compare, "öffi", "Peter", -1);
test("German Umlaut O: 2", compare, "Oben", "öffi", -1);
test("German Umlaut A: 1", compare, "Ähem", "Beer", -1);
test("German Umlaut A: 2", compare, "Adele", "Ähem", -1);
test("German Umlaut U: 1", compare, "Über", "verinice", -1);
test("German Umlaut U: 2", compare, "Uber", "Über", -1);
test("Mueller", compare, "Mueller", "Müller", -1);
test("DIN5007Var1: 1", compare, "Göbel", "Goethe", -1);
test("DIN5007Var1: 2", compare, "Goldmann", "Göthe", -1);
test("DIN5007Var1: 3", compare, "Goethe", "Goldmann", -1);
test("DIN5007Var1: 4", compare, "Göthe", "Götz", -1);
test("German Umlaut S: 1", compare, "ßuper", "Tor", -1);
test("German Umlaut S: 2", compare, "Salat", "ßuper", -1);
test("Starts with number: 1.0 < 1.1", compare, "1.0 Topic A", "1.1 Topic B", -1);
test("Starts with number: 9.0 < 10.0", compare, "9.0 Lorem", "10.0 Ipsum", -1);
test("Starts with number and Umlauts", compare, "1.0 Göbel", "1.0 Goethe", -1);
test("Nummern: 2 < 2.1", compare, "2", "2.1", -1);
test("Nummern: 5 > 2.1", compare, "5", "2.1", 1);
test("Nummern: 1 < 2.1", compare, "1", "2.1", -1);
test("Nummern: 2 < 2.a", compare, "2", "2.a", -1);
test("Nummern: A > 2", compare, "A", "2", 1);
test("Nummern: A > 2.1", compare, "A", "2.1", 1);
test("Nummern: A < A.1", compare, "A", "A.1", -1);
test("Nummern: 2.1 > 2.2", compare, "2.1", "2.2", -1);
test("Nummern: 2.1 == 2.1", compare, "2.1", "2.1", 0);
test("Nummern: 3.b.4 < 3.c.4", compare, "3.b.4", "3.c.4", -1);
test("Nummern: 2.4.a < 2.4.b", compare, "2.4.a", "2.4.b", -1);
test("Nummern: 10.4876.B == 10.4876.B", compare, "10.4876.B", "10.4876.B", 0);
test("Nummern: 10b > 10a", compare, "10b", "10a", 1);
test("Nummern: 2.01 > 2.1", compare, "2.01", "2.1", 1);
test("Nummern: 2.01 < 2.6", compare, "2.01", "2.6", -1);
test("Nummern: 234.0002.1 > 234.2.1", compare, "234.0002.1", "234.2.1", 1);
test("Nummern: 2.01 < 2.11", compare, "2.01", "2.11", -1);
