import { useEffect, useState } from "react";
var useLocation = function(defaultLocation) {
  var _a = useState(
      (window.location.hash && window.location.hash.substr(1)) ||
        defaultLocation
    ),
    currentLocation = _a[0],
    setCurrentLocation = _a[1];
  useEffect(function() {
    var onHashChange = function() {
      setCurrentLocation(window.location.hash.substr(1));
    };
    window.addEventListener("hashchange", onHashChange);
    return function() {
      window.removeEventListener("hashchange", onHashChange);
    };
  });
  return currentLocation;
};
export default useLocation;
