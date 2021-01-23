import { useTextInput } from "paperclip-designer/src/components/TextInput";
import { Spinner } from "paperclip-designer/src/components/Spinner";
import React, { memo, useState } from "react";
import { useProjects } from "../../../hooks/resources";
import * as styles from "./index.pc";
import { Project } from "../../../state";
import { useHistory } from "react-router";

export const Projects = memo(() => {
  const projects = useProjects();
  // const [filter, setFilter] = useState<string>();
  // const { inputProps: filterProps } = useTextInput({
  //   value: filter,
  //   onValueChange: setFilter
  // });

  let content;

  if (!projects.data) {
    content = <Spinner />
  } else {
    content = projects.data!.map(project => {
      return <ProjectCell key={project.id} item={project} />;
    });
  }


  return <styles.Container>
    <styles.Header  />
    <styles.Content>
      {content}
    </styles.Content>
  </styles.Container>
});

export type ProjectCellProps = {
  item: Project
}

const ProjectCell = memo(({ item: project }: ProjectCellProps) => {
  const history = useHistory();
  const onClick = () => {
    history.push(`/projects/${project.id}`);
  }
  return <styles.Project lastModified={`Last modified: ?`} name={project.name || "Untitled"} onClick={onClick} screenshot={null} />;
});