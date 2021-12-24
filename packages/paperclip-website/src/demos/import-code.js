const SOURCE = `

// PC files are compiled to plain code & can 
// be imported as regular modules
import * as styles from "./styles.pc";

function GroceryList({groceries}) {
  return <styles.List>
    {
      groceries.map(item => (
        <styles.ListItem>{item}</styles.ListItem>
      ))
    }
  </styles.List>;  
}

`.trim();

export default SOURCE;
