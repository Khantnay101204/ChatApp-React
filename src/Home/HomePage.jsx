import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";

import ChatBox from "./ChatBox";
import MsgBubble from "./MsgBubble";
import fetchMsg from "./fetchMsg";

function Home() {
  const token = Cookies.get("jwt");
  const userID = jwtDecode(token).id;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      await fetchMsg(setMessages, token);
    };
    fetch();
  }, []);

  return (
    <div className="h-screen w-screen flex  justify-center items-center">
      <ChatBox messages={messages} setMessages={setMessages} userID={userID}>
        {messages.map((msg) => (
          <MsgBubble msgObj={msg} setMessages={setMessages} userID={userID} />
        ))}
      </ChatBox>
    </div>
  );
}
export default Home;
