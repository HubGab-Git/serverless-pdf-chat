import React, { useState } from "react";
import DocumentUploader from "../components/DocumentUploader";
import WebSiteUploader from "../components/WebSiteUploader";
import DocumentList from "../components/DocumentList";
import { Link } from "react-router-dom";

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
        handleWebsiteUrlChange={handleWebsiteUrlChange}/>
      <Link
              to={`/multichat/`}
              // key={document.documentid}
              className="block p-6 bg-white border border-gray-200 rounded hover:bg-gray-100"
            >
            </Link>
      <DocumentList />
    </>
  );
};

export default Documents;
