import { API } from "aws-amplify";
import { useState, useEffect } from 'react';

// Definicja typów dla propsów
interface MultiChatSidebarProps {
  onCheckboxChange: (option: string) => void; // Funkcja przyjmująca string i zwracająca void
  selectedCheckboxes: string[]; // Tablica stringów
}
const MultiChatSidebar: React.FC<MultiChatSidebarProps> = ({ onCheckboxChange, selectedCheckboxes }) => {

  const [checkboxes, setCheckboxes] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get("serverless-pdf-chat", "/all_web_docs", {});
        console.log("response: "+ JSON.stringify(response, null, 2));
        const data = response.map((item: { filename: string }) => item.filename); 
        console.log("data: "+ JSON.stringify(data, null, 2));

        setCheckboxes(data);

        // Zaznacz wszystkie checkboxy i powiadom komponent nadrzędny
        data.forEach((option: string) => {
          onCheckboxChange(option);
        });
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchData();
  }, []); 

  return (
    <div className="col-span-4 h-full">
      <div className="flex flex-col">
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
