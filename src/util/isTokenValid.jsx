import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const isTokenValid = () => {
  const token = Cookies.get("jwt");
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;
    if (decoded.exp < now) {
      Cookies.remove("jwt");
      return false;
    }

    return true;
  } catch {
    Cookies.remove("jwt");
    return false;
  }
};

export default isTokenValid;
