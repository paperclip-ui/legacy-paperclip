#!/usr/local/bin/php -d memory_limit=2048M -d post_max_size=0
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