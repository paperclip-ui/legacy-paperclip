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
<ol export component as="List">
  <style>
    padding-left: 1em;
    font-family: Open Sans;
  </style>
  {children}
</ol>

<li export component as="ListItem">
  <style>
    margin-top: 6px;
  </style>
  {children}
</li>

<!-- 
  Preview
-->

<List>
  <ListItem>Bagels 🥯</ListItem>
  <ListItem>Yakitori 🍢</ListItem>
  <ListItem>Tofurky 🦃</ListItem>
  <ListItem>Skittles 🌈</ListItem>
</List>
`.trim();

export default SOURCE;
