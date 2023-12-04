import React, { useState, useEffect, KeyboardEvent } from "react";
// import { useParams} from "react-router-dom";
import { API } from "aws-amplify";
import { Conversation } from "../common/types";
import MultiChatSidebar from "../components/MultiChatSidebar";
import ChatMessages from "../components/ChatMessages";
import md5 from 'crypto-js/md5';
// import LoadingGrid from "../../public/loading-grid.svg";

const MultiChat: React.FC = () => {
  let conversationId = ''
  // const params = useParams();
  // const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  // const [loading, setLoading] = React.useState<string>("idle");
  const [messageStatus, setMessageStatus] = useState<string>("idle");
  // const [conversationListStatus, setConversationListStatus] = useState<
  //   "idle" | "loading"
  // >("idle");
  const [prompt, setPrompt] = useState("");

  const fetchData = async (conversationid = conversationId) => {
    // setLoading("loading");
    const conversation = await API.get(
      "serverless-pdf-chat",
      `/doc/web/${conversationid}`,
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

  // const addConversation = async () => {
  //   // setConversationListStatus("loading");
  //   const newConversation = await API.post(
  //     "serverless-pdf-chat",
  //     `/doc/web`,
  //     {}
  //   );
  //   fetchData(newConversation.conversationid);
  //   navigate(`/doc/web/${newConversation.conversationid}`);
  //   // setConversationListStatus("idle");
  // };

  // const switchConversation = (e: React.MouseEvent<HTMLButtonElement>) => {
  //   const targetButton = e.target as HTMLButtonElement;
  //   navigate(`/doc/web/${targetButton.id}`);
  //   fetchData(targetButton.id);
  // };

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
    let conversationString = selectedCheckboxes.join()
    conversationId = md5(conversationString).toString()
    await API.post(
      "serverless-pdf-chat",
      `/multichat`,
      {
        body: {
          fileName: selectedCheckboxes,
          prompt: prompt,
          conversationId: conversationId
        },
      }
    );
    setPrompt("");
    fetchData(conversationId);
    setMessageStatus("idle");
  };

  // let conver = {
  //   "conversationid": "jsrKAdW4svxwHRqnMHuD2K",
  //   "document": {
  //     "filename": "Tamponada_serca",
  //     "conversations": [
  //       {
  //         "conversationid": "jsrKAdW4svxwHRqnMHuD2K",
  //         "created": "2023-11-29T16:41:00.444465Z"
  //       }
  //     ],
  //     "docstatus": "READY",
  //     "filesize": "0",
  //     "userid": "d0c36275-5f90-4418-b4d0-81c92df094e7",
  //     "documentid": "2ecfzYwKWe3c73hpzhh9JZ",
  //     "created": "2023-11-29T16:41:00.444465Z",
  //     "pages": "0"
  //   },
  //   "messages": [
  //     {
  //       "type": "human",
  //       "data": {
  //         "type": "human",
  //         "content": "Podaj Objawy podmiotowe Tamponady serca",
  //         "additional_kwargs": {},
  //         "example": false
  //       }
  //     },
  //     {
  //       "type": "ai",
  //       "data": {
  //         "type": "ai",
  //         "content": " Zgodnie z podanym fragmentem, objawy podmiotowe tamponady serca to:\n\n- Duszność nasilająca się po przyjęciu pozycji leżącej \n- Zmniejszona tolerancja wysiłku fizycznego\n- Niekiedy kaszel \n- Dysfagia  \n- Omdlenie lub stan przedomdleniowy",
  //         "additional_kwargs": {},
  //         "example": false
  //       }
  //     }
  //   ]}

    const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);


    const handleCheckboxChange = (option: string) => {
      setSelectedCheckboxes(prev =>
        prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option]
      );
    };
    

  return (
    <div className="">
      {conversation && (
        <div className="grid grid-cols-12 border border-gray-200 rounded-lg">
          <MultiChatSidebar
            selectedCheckboxes={selectedCheckboxes}
            onCheckboxChange={handleCheckboxChange}
          />
          <ChatMessages
            selectedCheckboxes={selectedCheckboxes}
            prompt={prompt}
            conversation={conversation}
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
