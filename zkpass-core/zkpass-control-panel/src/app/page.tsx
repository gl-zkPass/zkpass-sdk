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
import { getLoginUser } from "@/backend/users/helpers/UsersHelper";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getLoginUser();
  if (!user) {
    redirect("/login");
  } else {
    redirect("/admin/keys");
  }
}
