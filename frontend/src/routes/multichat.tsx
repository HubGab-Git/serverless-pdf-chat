import React, { useState, useEffect, KeyboardEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "aws-amplify";
import { Conversation } from "../common/types";
import ChatSidebar from "../components/ChatSidebar";
import ChatMessages from "../components/ChatMessages";
// import LoadingGrid from "../../public/loading-grid.svg";

const MultiChat: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  // const [loading, setLoading] = React.useState<string>("idle");
  const [messageStatus, setMessageStatus] = useState<string>("idle");
  const [conversationListStatus, setConversationListStatus] = useState<
    "idle" | "loading"
  >("idle");
  const [prompt, setPrompt] = useState("");

  const fetchData = async (conversationid = params.conversationid) => {
    // setLoading("loading");
    const conversation = await API.get(
      "serverless-pdf-chat",
      `/doc/${params.documentid}/${conversationid}`,
      {}
    );
    setConversation(conversation);
    // setLoading("idle");
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
  };

  const addConversation = async () => {
    setConversationListStatus("loading");
    const newConversation = await API.post(
      "serverless-pdf-chat",
      `/doc/${params.documentid}`,
      {}
    );
    fetchData(newConversation.conversationid);
    navigate(`/doc/${params.documentid}/${newConversation.conversationid}`);
    setConversationListStatus("idle");
  };

  const switchConversation = (e: React.MouseEvent<HTMLButtonElement>) => {
    const targetButton = e.target as HTMLButtonElement;
    navigate(`/doc/${params.documentid}/${targetButton.id}`);
    fetchData(targetButton.id);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key == "Enter") {
      submitMessage();
    }
  };

  const submitMessage = async () => {
    setMessageStatus("loading");

    if (conversation !== null) {
      const previewMessage = {
        type: "text",
        data: {
          content: prompt,
          additional_kwargs: {},
          example: false,
        },
      };

      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, previewMessage],
      };

      setConversation(updatedConversation);
    }

    await API.post(
      "serverless-pdf-chat",
      `/${conversation?.document.documentid}/${conversation?.conversationid}`,
      {
        body: {
          fileName: conversation?.document.filename,
          prompt: prompt,
        },
      }
    );
    setPrompt("");
    fetchData(conversation?.conversationid);
    setMessageStatus("idle");
  };

  let conver = {
    "conversationid": "jsrKAdW4svxwHRqnMHuD2K",
    "document": {
      "filename": "Tamponada_serca",
      "conversations": [
        {
          "conversationid": "jsrKAdW4svxwHRqnMHuD2K",
          "created": "2023-11-29T16:41:00.444465Z"
        }
      ],
      "docstatus": "READY",
      "filesize": "0",
      "userid": "d0c36275-5f90-4418-b4d0-81c92df094e7",
      "documentid": "2ecfzYwKWe3c73hpzhh9JZ",
      "created": "2023-11-29T16:41:00.444465Z",
      "pages": "0"
    },
    "messages": [
      {
        "type": "human",
        "data": {
          "type": "human",
          "content": "Podaj Objawy podmiotowe Tamponady serca",
          "additional_kwargs": {},
          "example": false
        }
      },
      {
        "type": "ai",
        "data": {
          "type": "ai",
          "content": " Zgodnie z podanym fragmentem, objawy podmiotowe tamponady serca to:\n\n- Duszność nasilająca się po przyjęciu pozycji leżącej \n- Zmniejszona tolerancja wysiłku fizycznego\n- Niekiedy kaszel \n- Dysfagia  \n- Omdlenie lub stan przedomdleniowy",
          "additional_kwargs": {},
          "example": false
        }
      }
    ]}

  return (
    <div className="">
      {/* {loading === "loading" && !conversation && (
        <div className="flex flex-col items-center mt-6">
          <img src={LoadingGrid} width={40} />
        </div>
      )} */}
      {conver && (
        <div className="grid grid-cols-12 border border-gray-200 rounded-lg">
          <ChatSidebar
            conversation={conver}
            params={params}
            addConversation={addConversation}
            switchConversation={switchConversation}
            conversationListStatus={conversationListStatus}
          />
          <ChatMessages
            prompt={prompt}
            conversation={conver}
            messageStatus={messageStatus}
            submitMessage={submitMessage}
            handleKeyPress={handleKeyPress}
            handlePromptChange={handlePromptChange}
          />
        </div>
      )}
    </div>
  );
};

export default MultiChat;
