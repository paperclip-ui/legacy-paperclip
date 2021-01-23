import { useEffect } from "react";
import { projectFilesHookUsed, projectHookUsed } from "../actions";
import { useAppStore } from "./useAppStore";

export function useProject(projectId: number) {
  const { state, dispatch } = useAppStore();
  useEffect(() => {
    dispatch(projectHookUsed({ projectId }));
  });

  return state.currentProject || { done: false };
}

export function useProjectFiles(projectId: number) {
  const { state, dispatch } = useAppStore();
  useEffect(() => {
    dispatch(projectFilesHookUsed({ projectId }));
  });

  return state.currentProjectFiles || { done: false };
}

export function useProjects() {
  const { state, dispatch } = useAppStore();
  useEffect(() => {
    dispatch(projectFilesHookUsed(null));
  });

  return state.allProjects || { done: false };
}
