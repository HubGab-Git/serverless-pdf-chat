import React, { useState } from "react";
import DocumentUploader from "../components/DocumentUploader";
import WebSiteUploader from "../components/WebSiteUploader";
import DocumentList from "../components/DocumentList";

const Documents: React.FC = () => {
  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const [prompt, setPrompt] = useState("");
  return (
    <>
      <DocumentUploader />
      <WebSiteUploader 
        prompt={prompt}
        // messageStatus={messageStatus}
        // submitMessage={submitMessage}
        // handleKeyPress={handleKeyPress}
        handlePromptChange={handlePromptChange}/>
      <DocumentList />
    </>
  );
};

export default Documents;
