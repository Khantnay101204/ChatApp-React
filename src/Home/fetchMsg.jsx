const fetchMsg = async (setMessages, token) => {
  try {
    const response = await fetch("http://127.0.0.1:8000/api/v1/messages/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    setMessages(data.data.messages);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};
export default fetchMsg;
