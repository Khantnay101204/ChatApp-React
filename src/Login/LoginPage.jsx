import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const onLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("jwt", data.token, { expires: 1 });
      } else {
        console.log("Login failed: ", data.message);
      }

      setEmail("");
      setPassword("");
      navigate("/home");
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className=" h-screen w-screen flex  justify-center items-center">
      <div className="flex flex-col h-80 w-1/3 border border-black justify-center items-center rounded-xl ">
        <input
          className="border border-black h-10 w-5/6 rounded-lg m-2 p-2"
          type="text"
          onChange={handleEmailChange}
          value={email}
        ></input>
        <input
          className="border border-black h-10 w-5/6 rounded-lg m-2 p-2"
          type="password"
          onChange={handlePasswordChange}
          value={password}
        ></input>

        <button
          className="border border-black w-1/4 m-2 h-10 rounded-lg"
          onClick={onLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
export default Login;
