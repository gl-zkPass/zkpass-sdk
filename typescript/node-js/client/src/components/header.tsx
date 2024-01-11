/*
 * header.tsx
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: October 31st 2023
 * -----
 * Last Modified: December 15th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import { MYNAMASTE_URL } from "@/utils/constants";

export default function HeaderBar({ user }: { user: string | undefined }) {
  const router = useRouter();

  const _handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    fetch(`${MYNAMASTE_URL}/api/logout`, {
      method: "POST",
      body: JSON.stringify({}),
    })
      .then(async (res) => {
        console.log(res);
        interface LogoutResponse {
          status: number;
          message: string;
        }
        const body: LogoutResponse = await res.json();
        console.log(body);
        router.push("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Namaste
          </Typography>
          {!user ? (
            <Button href="/" color="inherit">
              Login
            </Button>
          ) : (
            <Button href="/" color="inherit" onClick={_handleLogout}>
              Logout: {user}
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
