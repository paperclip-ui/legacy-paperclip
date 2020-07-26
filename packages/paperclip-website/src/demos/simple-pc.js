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

<!-- These styles are scoped -->
<style>
  ol {
    padding-left: 1em;
    font-family: Open Sans;
  }
  li {
    margin-top: 6px;
  }
</style>

<!-- Components exported to code -->
<ol export component as="List">
  {children}
</ol>

<li export component as="ListItem">
  {children}
</li>

<!-- Preview of UI -->
<List>
  <ListItem>Something</ListItem>
  <ListItem>Something</ListItem>
  <ListItem>Something</ListItem>
</List>
`.trim();

export default SOURCE;
