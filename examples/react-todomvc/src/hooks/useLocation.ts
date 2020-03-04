import { useEffect, useState } from "react";

const useLocation = (defaultLocation: string) => {
  const [currentLocation, setCurrentLocation] = useState(
    (window.location.hash && window.location.hash.substr(1)) || defaultLocation
  );

  useEffect(() => {
    const onHashChange = () => {
      setCurrentLocation(window.location.hash.substr(1));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  });

  return currentLocation;
};

export default useLocation;
