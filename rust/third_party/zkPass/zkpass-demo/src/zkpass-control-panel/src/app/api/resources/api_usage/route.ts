/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { StatusCodes } from "http-status-codes";
import container from "@/backend/inversify.config";
import { IListAPIKeyUsageService } from "@resources/interfaces/ResourcesServicesInterfaces";
import { getLoginUser } from "@users/helpers/UsersHelper";
import { User } from "@users/interfaces/UsersInterfaces";
import { FilterApiUsagePayload } from "@/backend/resources/interfaces/ResourcesInterfaces";
import { PaginationDefault } from "@/backend/users/constants/UsersConstants";

/**
 * Example usage
 */
export async function POST(request: Request) {
  try {
    const loginUser = await _getValidLoginUser();

    const listApiUsageService = container.get<IListAPIKeyUsageService>(
      "IListAPIKeyUsageService"
    );

    let filter: FilterApiUsagePayload = await request.json();
    const data = await listApiUsageService.listApiUsage(
      loginUser,
      filter,
      (filter.start_index - 1) * PaginationDefault.Take,
      PaginationDefault.Take
    );

    return new Response(JSON.stringify({ data }), {
      status: StatusCodes.OK,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log({ error });
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: StatusCodes.BAD_REQUEST,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

async function _getValidLoginUser(): Promise<User> {
  const loginUser = await getLoginUser();
  if (!loginUser) {
    throw new Error("Login user not found");
  }
  return loginUser;
}
