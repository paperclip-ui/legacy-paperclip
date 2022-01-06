import { useTextInput } from "@tandemui/designer/src/components/TextInput";
import { Spinner } from "@tandemui/designer/src/components/Spinner";
import React, { memo, useState } from "react";
import { useProjects } from "../../../hooks/resources";
import * as styles from "./index.pc";
import { Project } from "../../../state";
import { useHistory } from "react-router";
import { useSelect } from "@tandemui/designer/src/components/Select";
import { useAppStore } from "../../../hooks/useAppStore";
import {
  deleteProjectConfirmed,
  newProjectEntered,
  projectRenamed
} from "../../../actions";

export const Projects = memo(() => {
  const projects = useProjects();
  const { dispatch } = useAppStore();

  let content;

  if (!projects.data) {
    content = <Spinner />;
  } else {
    content = projects.data!.map(project => {
      return <ProjectCell key={project.id} item={project} />;
    });
  }

  const onCreateClick = () => {
    const name = prompt(`Project name`);
    if (name) {
      dispatch(newProjectEntered({ name }));
    }
  };

  return (
    <styles.Container>
      <styles.Header onCreateClick={onCreateClick} />
      <styles.Content>{content}</styles.Content>
    </styles.Container>
  );
});

export type ProjectCellProps = {
  item: Project;
};

const ProjectCell = memo(({ item: project }: ProjectCellProps) => {
  const {
    select,
    renaming,
    renamingInputProps,
    onOpenClick,
    onClick,
    lastModifiedDays,
    projectName,
    onDeleteClick,
    onRenameClick
  } = useProjectCell(project);

  return (
    <styles.Project
      lastModified={`Last modified: ${
        lastModifiedDays === 0
          ? "today"
          : lastModifiedDays === 1
          ? "yesterday"
          : `${lastModifiedDays} days ago`
      }`}
      name={
        renaming ? (
          <styles.NameInput
            ref={renamingInputProps.ref}
            onKeyPress={renamingInputProps.onKeyPress}
            onBlur={renamingInputProps.onBlur}
            onChange={renamingInputProps.onChange}
          />
        ) : (
          projectName
        )
      }
      onClick={onClick}
      screenshot={null}
      moreSelect={
        <styles.MoreSelect
          ref={select.ref}
          onClick={select.onClick}
          onBlur={select.onBlur}
          menu={
            select.menuVisible && (
              <styles.MoreMenu
                onRenameClick={onRenameClick}
                onDeleteClick={onDeleteClick}
                onOpenClick={onOpenClick}
              />
            )
          }
        >
          <styles.MoreButton onClick={select.onButtonClick} />
        </styles.MoreSelect>
      }
    />
  );
});

const useProjectCell = (project: Project) => {
  const projectName = project.name || "Untitled";
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState<string>(project.name);
  const history = useHistory();
  const { dispatch } = useAppStore();
  const onClick = () => {
    history.push(`/projects/${project.id}`);
  };

  const onRenameClick = () => {
    setRenaming(true);
  };
  const onDeleteClick = () => {
    if (
      prompt(`To confirm, type "${projectName}" in order to delete.`) ===
      projectName
    ) {
      dispatch(deleteProjectConfirmed({ projectId: project.id }));
    }
  };
  const onOpenClick = onClick;

  const updatedAt = new Date(project.updatedAt);

  const lastModifiedDays = Math.floor(
    (Date.now() - updatedAt.getTime()) / 24 / 3600 / 1000
  );

  const select = useSelect();
  const renamingInputProps = useTextInput({
    value: newName,
    onValueChange: setNewName,
    onSave(newName) {
      setRenaming(false);
      dispatch(projectRenamed({ projectId: project.id, newName }));
    }
  }).inputProps;

  return {
    select,
    onDeleteClick,
    renamingInputProps,
    onOpenClick,
    onClick,
    renaming,
    projectName: newName || projectName,
    onRenameClick,
    lastModifiedDays
  };
};
