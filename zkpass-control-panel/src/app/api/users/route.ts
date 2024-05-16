/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
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
import container from "@/backend/inversify.config";
import { FilterUsersPayload } from "@/backend/requests/UsersRequestInterface";
import {
  PaginationDefault,
  PlaceholderValue,
  UserStatus,
} from "@/backend/users/constants/UsersConstants";
import { getLoginUser } from "@/backend/users/helpers/UsersHelper";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import {
  IAddUsersService,
  IDeleteUsersService,
  IListUsersService,
  IUpdateUsersService,
} from "@users/interfaces/UsersServicesInterfaces";
import { StatusCodes } from "http-status-codes";

export async function POST(request: Request) {
  try {
    let { filter, skip, take } = await request.json();
    let formatedFilter: FilterUsersPayload | null = null;
    if (filter) {
      formatedFilter = filter as any as FilterUsersPayload;
    }
    const loginUser = await _getValidLoginUser();
    const listUsersService =
      container.get<IListUsersService>("IListUsersService");
    const data = await listUsersService.listUsers(
      loginUser,
      formatedFilter,
      skip ?? PaginationDefault.Skip,
      take ?? PaginationDefault.Take
    );
    return new Response(JSON.stringify({ data }), {
      status: StatusCodes.OK,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error }), {
      status: StatusCodes.BAD_REQUEST,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
export async function PUT(request: Request) {
  try {
    const { email, name, role } = await request.json();
    const loginUser = await _getValidLoginUser();

    const addUserService = container.get<IAddUsersService>("IAddUsersService");
    const user: User = {
      id: Number(PlaceholderValue.Number),
      status: UserStatus.Active,
      email,
      name,
      role,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      createdBy: String(PlaceholderValue.String),
      lastModifiedBy: String(PlaceholderValue.String),
    };

    const result = await addUserService.addUser(loginUser, user);
    return new Response(JSON.stringify({ data: result }), {
      status: StatusCodes.OK,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const typedError: Error = error as Error;
    return new Response(JSON.stringify({ error: typedError.message }), {
      status: StatusCodes.BAD_REQUEST,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
export async function DELETE(request: Request) {
  try {
    const { user_id, email } = await request.json();
    const loginUser = await _getValidLoginUser();
    const deleteUsersService = container.get<IDeleteUsersService>(
      "IDeleteUsersService"
    );
    const user: User = {
      id: user_id,
      email: email,
      name: String(PlaceholderValue.String),
      status: UserStatus.Active,
      role: Number(PlaceholderValue.Number),
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      createdBy: String(PlaceholderValue.String),
      lastModifiedBy: String(PlaceholderValue.String),
    };
    const result = await deleteUsersService.deleteUser(loginUser, user);
    return new Response(JSON.stringify({ data: result }), {
      status: StatusCodes.OK,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const typedError: Error = error as Error;
    return new Response(JSON.stringify({ error: typedError.message }), {
      status: StatusCodes.BAD_REQUEST,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
export async function PATCH(request: Request) {
  try {
    const { email, name, status } = await request.json();
    const loginUser = await _getValidLoginUser();
    const updateUsersService = container.get<IUpdateUsersService>(
      "IUpdateUsersService"
    );
    const user: User = {
      id: Number(PlaceholderValue.Number),
      email,
      name,
      status,
      role: Number(PlaceholderValue.Number),
      createdAt: new Date(),
      lastModifiedAt: new Date(),
      createdBy: String(PlaceholderValue.String),
      lastModifiedBy: String(PlaceholderValue.String),
    };
    const result = await updateUsersService.updateUser(loginUser, user);
    return new Response(JSON.stringify({ data: result }), {
      status: StatusCodes.OK,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const typedError: Error = error as Error;
    return new Response(JSON.stringify({ error: typedError.message }), {
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
