import React, { useState, useEffect, KeyboardEvent } from "react";
import { API } from "aws-amplify";
import { Conversation } from "../common/types";
import MultiChatSidebar from "../components/MultiChatSidebar";
import ChatMessages from "../components/ChatMessages";
import md5 from 'crypto-js/md5';

const MultiChat: React.FC = () => {
  let conversationId = 'web'
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageStatus, setMessageStatus] = useState<string>("idle");
  const [prompt, setPrompt] = useState("");
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);

  const fetchData = async (conversationid = conversationId) => {
    const conversation = await API.get(
      "serverless-pdf-chat",
      `/doc/web/${conversationid}`,
      {}
    );
    console.log("odpowiedz: "+ JSON.stringify(conversation, null, 2))
    setConversation(conversation);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePromptChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value);
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
