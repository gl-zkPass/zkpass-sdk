/*
 * page.tsx
 * 
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: October 31st 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   
 * ---
 * References:
 *   NONE
 * ---
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
