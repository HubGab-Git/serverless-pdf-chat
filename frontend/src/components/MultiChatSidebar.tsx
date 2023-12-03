import { API } from "aws-amplify";
import { useState, useEffect } from 'react';

// Definicja typów dla propsów
interface MultiChatSidebarProps {
  onCheckboxChange: (option: string) => void; // Funkcja przyjmująca string i zwracająca void
  selectedCheckboxes: string[]; // Tablica stringów
}
const MultiChatSidebar: React.FC<MultiChatSidebarProps> = ({ onCheckboxChange, selectedCheckboxes }) => {
  // const [items, setItems] = useState([]);           // Stan dla przechowywania elementów z API
  // const [selectedItems, setSelectedItems] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  const [checkboxes, setCheckboxes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Załóżmy, że mamy endpoint API /api/items
        const response = await API.get("serverless-pdf-chat", "/all_web_docs", {});
        console.log("response: "+ JSON.stringify(response, null, 2));
        const data = response.map((item: { filename: string }) => item.filename); 
        console.log("data: "+ JSON.stringify(data, null, 2));
        setCheckboxes(data);
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchData();
  }, []); // Pusty array jako drugi argument oznacza, że efekt wykona się tylko raz po zamontowaniu komponentu

  return (
    <div className="col-span-4 h-full">
      <div>
      {checkboxes.map(option => (
        <label key={option}>
          <input
            type="checkbox"
            checked={selectedCheckboxes.includes(option)}
            onChange={() => onCheckboxChange(option)}
          />
          {option}
        </label>
      ))}
      </div>
    </div>
  );
};

export default MultiChatSidebar;
