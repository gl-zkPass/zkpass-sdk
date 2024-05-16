/*
 * loginUser.component.tsx
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: December 13th 2023
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
"use client";
import { Button, Card, CardBody, CardHeader } from "@nextui-org/react";
import { signIn } from "next-auth/react";

export default function LoginUserComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="w-1/2">
        <Card>
          <CardHeader className="justify-center">
            Sign in to your account
          </CardHeader>
          <CardBody>
            <div className="flex flex-col items-center">
              <Button
                className="w-1/3"
                color="primary"
                variant="flat"
                onClick={() =>
                  signIn("google", {
                    callbackUrl: "/",
                  })
                }
              >
                Login Using Google
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
