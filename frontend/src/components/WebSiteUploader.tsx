import {  useState, useEffect } from "react";
import { API } from "aws-amplify";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";


interface UrlInputProps {
  // messageStatus: string;
  handleWebsiteUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  // handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  websiteUrl: string;
  // submitMessage: () => Promise<void>;
}

const WebSiteUploader: React.FC<UrlInputProps> = ({
  websiteUrl,
  handleWebsiteUrlChange,
  // messageStatus,
  // submitMessage,
  
  // handleKeyPress,
}) => {
  const [webInputStatus, setWebInputStatus] = useState<string>("idle");
  // const [buttonStatus, setButtonStatus] = useState<string>("ready");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (selectedFile) {
      if (selectedFile.type === "application/pdf") {
        // setInputStatus("valid");
      } else {
        setSelectedFile(null);
      }
    }
  }, [selectedFile]);

  
  function delay(delay: number) {
    return new Promise( res => setTimeout(res, delay) );
  }
  
  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   setSelectedFile(file || null);
  // };

  // const uploadFile = async () => {
  //   // setButtonStatus("uploading");
  //   await API.get("serverless-pdf-chat", "/generate_presigned_url", {
  //     headers: { "Content-Type": "application/json" },
  //     queryStringParameters: {
  //       file_name: selectedFile?.name,
  //     },
  //   }).then((presigned_url) => {
  //     fetch(presigned_url.presignedurl, {
  //       method: "PUT",
  //       body: selectedFile,
  //       headers: { "Content-Type": "application/pdf" },
  //     }).then(() => {
  //       setButtonStatus("success");
  //     });
  //   });
  // };

  // const resetInput = () => {
  //   // setSelectedFile(null);
  //   setWebInputStatus("idle");
  //   // setButtonStatus("ready");
  // };
  // let prompt = "prompt"

  let handleKeyPress = () => {
    console.log("handleKeyPress")
  }

  const submitMessage = async () => {
    setWebInputStatus("loading");
    console.log("loading");
    await API.post("serverless-pdf-chat", "/upload_website", {
      headers: { "Content-Type": "application/json" },
      queryStringParameters: {
        url: websiteUrl,
      },
    })
    setWebInputStatus("idle");
    console.log("backidle");
  }
  return (
    <div>
      <h2 className="text-2xl font-bold pb-4 pt-6">Add MP Website</h2>
      <div className="relative">
          <input
            disabled={webInputStatus === "loading"}
            type="text"
            id="websiteUrlInput"
            value={websiteUrl}
            onChange={handleWebsiteUrlChange}
            onKeyDown={handleKeyPress}
            className={
              webInputStatus === "loading"
                ? "block w-full p-4 pl-4 text-sm text-gray-500 border border-gray-200 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                : "block w-full p-4 pl-4 text-sm text-gray-900 border border-gray-200 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            }
            placeholder={
              "https://www.mp.pl/interna/chapter/..."
            }
          />
          {webInputStatus === "idle" && (
            <button
              type="submit"
              className="text-gray-700 absolute right-2 bottom-2 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
              onClick={submitMessage}
            >
              <DocumentMagnifyingGlassIcon className="w-6 h-6" />
            </button>
          )}
          {webInputStatus === "loading" && (
            <button
              disabled
              type="submit"
              className="text-gray-700 absolute right-2 bottom-2 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
            >
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="#4C1D95"
                />
              </svg>
            </button>
          )}
        </div>
    </div>
  );
};

export default WebSiteUploader;
