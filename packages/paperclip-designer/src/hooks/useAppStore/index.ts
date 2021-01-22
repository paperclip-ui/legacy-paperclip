import { useContext } from "react";
import { AppStoreContext } from "../../contexts";

export const useAppStore = () => {
  return useContext(AppStoreContext);
};
