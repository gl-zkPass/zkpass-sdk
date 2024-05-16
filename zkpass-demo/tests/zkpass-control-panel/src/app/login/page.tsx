/*
 * page.tsx
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: December 6th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { getLoginUser } from "@users/helpers/UsersHelper";
import LoginUserComponent from "./loginUser.component";
import { redirect } from "next/navigation";

export default async function LoginUser() {
  const user = await getLoginUser();
  if (user) {
    redirect("/");
  }
  return (
    <>
      <LoginUserComponent>Login User page</LoginUserComponent>
    </>
  );
}
