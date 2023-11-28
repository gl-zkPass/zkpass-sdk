/*
 * Filename: typescript/node-js/client/src/app/users/page.tsx
 * Path: typescript/node-js/client
 * Created Date: Monday, November 27th 2023, 4:42:11 pm
 * Author: Naufal Fakhri Muhammad
 *
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
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
