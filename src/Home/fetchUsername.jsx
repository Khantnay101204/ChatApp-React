const fetchUsername = async (userId, setUsername, token) => {
  if (!userId) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/v1/users/${userId}/username`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    const data = await response.json();
    setUsername(data.data.username);
  } catch (err) {
    console.error("Fetch username error:", err);
    setUsername("Unknown User");
  }
};

export default fetchUsername;
