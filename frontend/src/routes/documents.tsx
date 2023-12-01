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
          className="text-center block p-6 bg-white border border-gray-200 rounded hover:bg-gray-100"
        > 
        <div
            className="bg-gray-50 w-full inline-flex items-center px-4 py-2.5 border border-gray-100 rounded hover:bg-gray-200"
          >
            Start a new conversation
          </div>
      </Link>
      <DocumentList />
    </>
  );
};

export default Documents;
