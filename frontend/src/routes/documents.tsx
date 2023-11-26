import React from "react";
import DocumentUploader from "../components/DocumentUploader";
import WebSiteUploader from "../components/WebSiteUploader";
import DocumentList from "../components/DocumentList";

const Documents: React.FC = () => {
  return (
    <>
      <DocumentUploader />
      <WebSiteUploader />
      <DocumentList />
    </>
  );
};

export default Documents;
