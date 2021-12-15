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

<!-- Scoped to this document -->
<style>
  .font-regular {
    font-family: Open Sans;
  }
</style>

<ol export component as="List" class="font-regular">

  <!-- Scoped to this element & descendants -->
  <style>
    padding-left: 32px;
  </style>
  {children}
</ol>

<li export component as="ListItem" class="font-regular">
  <style>
    margin-top: 6px;
  </style>
  {children}
</li>
`.trim();

export default SOURCE;
