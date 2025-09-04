import { useEffect, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:8000");
function App() {
  const [msg, setMsg] = useState([]);
  const [text, setText] = useState("");
  const scrollRef = useRef(null);
  const userId = "68b8815f2c4280c48c87d91f";

  const socketIp = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchMsg = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/messages");
        const result = await res.json();
        setMsg(result.data.messages);
      } catch (err) {
        console.log(err);
      }
    };

    fetchMsg();

    socket.on("receiveMessage", (text) => {
      setMsg((prev) => [...prev, text]);
    });
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  });

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const sentMsg = () => {
    if (text.trim()) socket.emit("sendMessage", text, userId);
    setText("");
  };

  return (
    <div>
      <div class="msgBox" ref={scrollRef}>
        {msg.map((el, i) => (
          <div key={i}>
            <p>{el.text}</p>
          </div>
        ))}
      </div>
      <input
        class="inputBox"
        value={text}
        type="text"
        onChange={handleTextChange}
      ></input>
      <button onClick={sentMsg}>Sent</button>
    </div>
  );
}

export default App;
