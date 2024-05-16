/*
 * route.ts
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id))
 * Created at: December 14th 2023
 * -----
 * Last Modified: December 15th 2023
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import container from "@/backend/inversify.config";
import { PlaceholderValue } from "@/backend/keys/constants/KeysConstants";
import { FilterUserApisPayload } from "@/backend/requests/UserApisRequestInterface";
import {
  PaginationDefault,
  UserAPIStatus,
} from "@/backend/userApis/constants/UserApiConstants";
import { UserAPI } from "@/backend/userApis/interfaces/UserApiInterface";
import {
  IAddUserApiService,
  IDeleteUserApiService,
  IListUserApiService,
  IUpdateUserApiService,
} from "@/backend/userApis/interfaces/UserApiServiceInterfaces";
import { getLoginUser } from "@/backend/users/helpers/UsersHelper";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { StatusCodes } from "http-status-codes";

export async function POST(request: Request) {
  // List User API with or without filters
  try {
    let { filter, skip, take } = await request.json();
    let formatedFilter: FilterUserApisPayload | null = null;
    if (filter) {
      formatedFilter = filter as any as FilterUserApisPayload;
    }
    const loginUser = await _getValidLoginUser();
    const listUserApiService = container.get<IListUserApiService>(
      "IListUserApiService"
    );
    const data = await listUserApiService.listUserApis(
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
    const typedError: Error = error as Error;
    return new Response(JSON.stringify({ error: typedError.message }), {
      status: StatusCodes.BAD_REQUEST,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function PUT(request: Request) {
  // Create new UserAPi
  try {
    const { email, name } = await request.json();
    const loginUser = await _getValidLoginUser();

    const addUserApiService =
      container.get<IAddUserApiService>("IAddUserApiService");
    const currentDate = new Date();
    const userApi: UserAPI = {
      id: Number(PlaceholderValue.Number),
      email: email,
      name: name,
      status: UserAPIStatus.Active,
      createdAt: currentDate,
      createdBy: loginUser.email,
      lastModifiedAt: currentDate,
      lastModifiedBy: loginUser.email,
    };
    const userApiResultId = await addUserApiService.addUserApi(
      loginUser,
      userApi
    );
    return new Response(
      JSON.stringify({
        data: userApiResultId,
      }),
      {
        status: StatusCodes.OK,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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
  // Delete UserAPI
  try {
    const { email, id } = await request.json();
    const loginUser = await _getValidLoginUser();
    const deleteUserApiService = container.get<IDeleteUserApiService>(
      "IDeleteUserApiService"
    );
    const userApi: UserAPI = {
      id: id,
      status: UserAPIStatus.Active,
      email: email,
      name: "",
      createdAt: new Date(),
      lastModifiedBy: loginUser.email,
      lastModifiedAt: new Date(),
      createdBy: loginUser.email,
    };
    const result = await deleteUserApiService.deleteUserApi(loginUser, userApi);
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
  // Update User API
  try {
    const { id, email, name, status } = await request.json();
    const loginUser = await _getValidLoginUser();
    const updateUserApiService = container.get<IUpdateUserApiService>(
      "IUpdateUserApiService"
    );
    const userApi: UserAPI = {
      id,
      email,
      name,
      createdBy: "",
      status,
      lastModifiedBy: loginUser.email,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    };
    console.log({ userApi });

    const result = await updateUserApiService.updateUserApis(
      loginUser,
      userApi
    );
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
