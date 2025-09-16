import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8000");

function ChatBox({ children, messages, setMessages, userID }) {
  const [msg, setMsg] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const handleReceive = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleInputChange = (e) => {
    setMsg(e.target.value);
  };

  const handleOnSend = () => {
    if (!msg) {
      return;
    }
    socket.emit("send_message", { userID, msg });
    setMsg("");
  };
  return (
    <div className="border border-black h-2/3 w-1/3 rounded-xl flex flex-col">
      <div
        ref={containerRef}
        className="border border-black h-[90%] w-full rounded-t-xl overflow-auto"
      >
        {children}
      </div>
      <div className="w-full h-[10%] flex flex-row">
        <textarea
          value={msg}
          className="w-[85%] h-full border border-black  resize-none rounded-bl-xl p-2 focus:outline-none"
          placeholder="Type here..."
          onChange={handleInputChange}
        ></textarea>
        <button
          className="w-[15%] h-full border border-black rounded-br-xl"
          onClick={handleOnSend}
        >
          Send
        </button>
      </div>
    </div>
  );
}
export default ChatBox;
