const SOURCE = `
<?php
  require "./test.pc.php";

  function render_grocery_list($groceries) {

    $children = "";

    foreach ($groceries as $item) {
      $children .= styles\grocery_list_item(array(), $item);
    }

    return styles\grocery_list(array(), $children);
  }

  echo render_grocery_list(array("bananas", "milk"));
?>

`.trim();

export default SOURCE;
