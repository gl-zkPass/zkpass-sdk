/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 12th 2023
 * -----
 * Last Modified: December 14th 2023
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
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import container from "@/backend/inversify.config";
import { IUsersRepository } from "@users/interfaces/UsersRepoInterfaces";
import type { AuthOptions } from "next-auth";
import { UserStatus } from "@/backend/users/constants/UsersConstants";

export const authOptions: AuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (!user.email || !user.email.endsWith("@gdplabs.id")) {
        return false;
      }
      const validUser = await isValidUser(user.email);
      return validUser;
    },
  },
};
const handler = NextAuth(authOptions);

const isValidUser = async (email: string) => {
  const userRepo = container.get<IUsersRepository>("IUsersRepository");
  const user = await userRepo.findUser(email);
  let validUser = false;
  if (user) {
    validUser = user.status == UserStatus.Active;
  }
  return validUser;
};

export { handler as GET, handler as POST };
