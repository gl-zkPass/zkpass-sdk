import Cookies from "js-cookie";

export const getToken = (key: string = "_user") => {
  const cookie = Cookies.get(key);
  if (!cookie) {
    return null;
  }
  try {
    const token = JSON.parse(cookie);
    return token.token;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const removeUserCookie = () => {
  const cookie = Cookies.get("_user");
  if (!cookie) {
    return null;
  }
  Cookies.remove("_user");
};
