// import DocumentDetail from "./DocumentDetail";
// import { Conversation } from "../common/types";
// import { getDateTime } from "../common/utilities";
// import { Params } from "react-router-dom";
// import {
//   ChatBubbleLeftRightIcon,
//   PlusCircleIcon,
// } from "@heroicons/react/24/outline";
import { API } from "aws-amplify";
import { useState, useEffect } from 'react';

// interface ChatSidebarProps {
//   conversation: Conversation;
//   params: Params;
//   addConversation: () => Promise<void>;
//   switchConversation: (e: React.MouseEvent<HTMLButtonElement>) => void;
//   conversationListStatus: "idle" | "loading";
// }

const MultiChatSidebar= () => {
  const [items, setItems] = useState([]);           // Stan dla przechowywania elementów z API
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Załóżmy, że mamy endpoint API /api/items
        const response = await API.get("serverless-pdf-chat", "/all_web_docs", {});
        console.log("response: "+ JSON.stringify(response, null, 2));
        const data = response.map((item: { filename: any; }) => item.filename);
        console.log("data: "+ JSON.stringify(data, null, 2));
        setItems(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Pusty array jako drugi argument oznacza, że efekt wykona się tylko raz po zamontowaniu komponentu

  const handleSelectionChange = (item: never) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter(i => i !== item));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="col-span-4 h-full">
      <div>
        {items.map(item => (
          <div key={item}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={() => handleSelectionChange(item)}
            />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChatSidebar;
