import dedent from "dedent";

/*
const SOURCE = `
import * as styles from "./styles.pc";

function GroceryList() {

  const groceries = [
    "Milk 🥛", 
    "Water 💧", 
    "Taco seasoning 🌮"
  ];

  return <styles.List>
    {
      groceries.map(item => (
        <styles.ListItem>{item}</styles.ListItem>;
      ))
    }
  </styles.List>;  
}
`.trim();

export default SOURCE;

*/

const SOURCE = `

<!-- These styles are scoped to this document -->
<style>
  ol {
    padding-left: 1em;
    font-family: Open Sans;
  }
  li {
    margin-top: 6px;
  }
</style>

<!-- Components that can be imported into app code -->
<ol export component as="List">
  {children}
</ol>

<li export component as="ListItem">
  {children}
</li>

<!-- 
  Preview of UI for docs, development,
  and visual regression tests 
-->
<List>
  <ListItem>Bagels 🥯</ListItem>
  <ListItem>Yakitori 🍢</ListItem>
  <ListItem>Tofurky 🦃</ListItem>
  <ListItem>Skittles 🌈</ListItem>
</List>
`.trim();

export default SOURCE;
