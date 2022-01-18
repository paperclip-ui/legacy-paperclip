import { PCDocument } from "@paperclip-ui/editor-engine/lib/client/documents/pc";
import { useContext, useEffect, useState } from "react";
import { WorkspaceProjectContext } from "../../contexts";

export const useAllPaperclipDocuments = () => {
  const [documents, setDocuments] = useState<PCDocument[]>([]);
  const project = useContext(WorkspaceProjectContext);

  useEffect(() => {
    project && project.openAllPaperclipDocuments().then(setDocuments);
  }, [project]);

  return documents;
};
