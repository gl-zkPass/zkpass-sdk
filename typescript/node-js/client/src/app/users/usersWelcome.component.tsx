/*
 * Filename: typescript/node-js/client/src/app/users/usersWelcome.component.tsx
 * Path: typescript/node-js/client
 * Created Date: Monday, November 27th 2023, 4:42:11 pm
 * Author: Naufal Fakhri Muhammad
 *
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
      <div className="flex flex-col justify-start items-center h-screen pt-40">
        <Paper
          elevation={3}
          className="w-2/5 p-7 flex flex-col items-center gap-5"
        >
          <div>Welcome {user}!</div>
          <Button href="/onboarding" variant="outlined">
            Start Employee Onboarding
          </Button>
        </Paper>
      </div>
    </>
  );
}
