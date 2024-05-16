/*
 * header.component.tsx
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
import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Divider,
} from "@nextui-org/react";
import { useSession, signOut } from "next-auth/react";

export default function HeaderComponent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
        {session && (
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          />
        )}
        <NavbarBrand>
          <p className="font-bold text-inherit">zkPass CP</p>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          {session && (
            <Button
              as={Link}
              color="primary"
              href="#"
              variant="flat"
              onClick={() =>
                signOut({
                  callbackUrl: "/login",
                })
              }
            >
              Logout
            </Button>
          )}
        </NavbarItem>
      </NavbarContent>
      <NavbarMenu className="dark text-foreground">
        {session ? (
          <>
            <div className="flex flex-row items-center gap-4">
              <p className="text-xs">Users</p>
              <Divider />
            </div>
            <NavbarMenuItem key="list-users">
              <Link
                color="foreground"
                className="w-full"
                href="/admin/users"
                size="lg"
              >
                List Users
              </Link>
            </NavbarMenuItem>
            <div className="flex flex-row items-center gap-4">
              <p className="text-xs">Business</p>
              <Divider />
            </div>
            <NavbarMenuItem key="list-business">
              <Link
                color="foreground"
                className="w-full"
                href="/admin/business"
                size="lg"
              >
                List Business
              </Link>
            </NavbarMenuItem>
            <div className="flex flex-row items-center gap-4">
              <p className="text-xs">Keys</p>
              <Divider />
            </div>
            <NavbarMenuItem key="list-keys">
              <Link
                color="foreground"
                className="w-full"
                href="/admin/keys"
                size="lg"
              >
                List Keys
              </Link>
            </NavbarMenuItem>
            <div className="flex flex-row items-center gap-4">
              <p className="text-xs">Resources</p>
              <Divider />
            </div>
            <NavbarMenuItem key="monitoring">
              <Link
                color="foreground"
                className="w-full"
                href="/admin/resources"
                size="lg"
              >
                Monitoring
              </Link>
            </NavbarMenuItem>
          </>
        ) : (
          <></>
        )}
      </NavbarMenu>
    </Navbar>
  );
}
