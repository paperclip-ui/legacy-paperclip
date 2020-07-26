(window.webpackJsonp = window.webpackJsonp || []).push([
  [31],
  {
    140: function(n, s, t) {
      "use strict";
      t.r(s);
      var e = '\nimport * as styles from "./styles.pc";\n\nfunction GroceryList() {\n\n  const groceries = [\n    "Milk \ud83e\udd5b", \n    "Water \ud83d\udca7", \n    "Taco seasoning \ud83c\udf2e"\n  ];\n\n  return <styles.List>\n    {\n      groceries.map(item => (\n        <styles.ListItem>{item}</styles.ListItem>;\n      ))\n    }\n  </styles.List>;  \n}\n'.trim();
      s.default = e;
    }
  }
]);
