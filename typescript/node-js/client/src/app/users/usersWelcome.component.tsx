/*
 * usersWelcome.component.tsx
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: October 31st 2023
 * -----
 * Last Modified: August 20th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

"use client";

import HeaderBar from "@/components/header";
import { Button, Paper } from "@mui/material";
import { useRouter } from "next/navigation";

export default function UsersWelcome({ user }: { user: string | undefined }) {
  const router = useRouter();

  if (!user) {
    router.push("/");
  }

  return (
    <>
      <HeaderBar user={user} />
      <div className='flex flex-col justify-start items-center h-screen pt-40'>
        <Paper
          elevation={3}
          className='w-2/5 p-7 flex flex-col items-center gap-5'>
          <div>Welcome {user}!</div>
          <Button href='/onboarding?user-data=single' variant='outlined'>
            Start Employee Onboarding {"(Single User Data)"}
          </Button>
          <Button href='/onboarding?user-data=multiple' variant='outlined'>
            Start Employee Onboarding {"(Multiple User Data)"}
          </Button>
        </Paper>
      </div>
    </>
  );
}
