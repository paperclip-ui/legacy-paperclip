<?php
namespace styles;

function grocery_list($props, $children = "") {
  return "
  <ol class='_7dbe2ed5_font-regular _pub-7dbe2ed5_font-regular font-regular'>
    {$children}
  </ol>
  ";
}

function grocery_list_item($props, $children = "") {
  return "
  <li class='_7dbe2ed5_font-regular _pub-7dbe2ed5_font-regular font-regular'>
    {$children}
  </li>
  ";
}

?>