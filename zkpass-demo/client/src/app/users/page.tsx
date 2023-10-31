import { cookies } from "next/headers";
import UsersWelcome from "./usersWelcome.component";

export default function Users() {
  interface CookieValue {
    name: string;
    value: string;
  }
  const user: undefined | CookieValue = cookies().get("username");

  return <UsersWelcome user={user?.value} />;
}
