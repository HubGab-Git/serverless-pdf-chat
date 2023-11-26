import React, { useState } from "react";
import DocumentUploader from "../components/DocumentUploader";
import WebSiteUploader from "../components/WebSiteUploader";
import DocumentList from "../components/DocumentList";

const Documents: React.FC = () => {
  const handleWebsiteUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWebsiteUrl(event.target.value);
  };

  const [websiteUrl, setWebsiteUrl] = useState("");
  return (
    <>
      <DocumentUploader />
      <WebSiteUploader 
        websiteUrl={websiteUrl}
        // messageStatus={messageStatus}
        // submitMessage={submitMessage}
        // handleKeyPress={handleKeyPress}
        handleWebsiteUrlChange={handleWebsiteUrlChange}/>
      <DocumentList />
    </>
  );
};

export default Documents;
