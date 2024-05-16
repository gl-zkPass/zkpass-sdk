/*
 * route.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: December 22nd 2023
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import container from "@/backend/inversify.config";
import {
  APIKeyStatus,
  PaginationDefault,
  PlaceholderValue,
} from "@/backend/keys/constants/KeysConstants";
import { APIKey } from "@/backend/keys/interfaces/KeysInterface";
import {
  IAddKeysService,
  IDeleteKeysService,
  IListKeysService,
  IUpdateKeysService,
} from "@/backend/keys/interfaces/KeysServiceInterfaces";
import { FilterKeysPayload } from "@/backend/requests/KeysRequestInterface";
import { getLoginUser } from "@/backend/users/helpers/UsersHelper";
import { User } from "@/backend/users/interfaces/UsersInterfaces";
import { StatusCodes } from "http-status-codes";

export async function POST(request: Request) {
  // List API keys, with or without filters
  try {
    let { filter, skip, take } = await request.json();
    let formatedFilter: FilterKeysPayload | null = null;
    if (filter) {
      formatedFilter = filter as any as FilterKeysPayload;
    }
    const loginUser = await _getValidLoginUser();
    const listKeysService = container.get<IListKeysService>("IListKeysService");
    const data = await listKeysService.listKeys(
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
  // Create new API key
  try {
    const { apiName, email } = await request.json();
    const loginUser = await _getValidLoginUser();

    const addKeysService = container.get<IAddKeysService>("IAddKeysService");
    const currentDate = new Date();

    const apiKey: APIKey = {
      id: Number(PlaceholderValue.Number),
      status: APIKeyStatus.Active,
      key: "",
      secretKey: "",
      name: apiName,
      userId: 0,
      createdBy: loginUser.email,
      createdAt: currentDate,
      lastModifiedBy: loginUser.email,
      lastModifiedAt: currentDate,
    };
    const result = await addKeysService.addKey(loginUser, apiKey, email);
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
  // Delete API key
  try {
    const { userId, key, id } = await request.json();
    const loginUser = await _getValidLoginUser();
    const deleteKeysService =
      container.get<IDeleteKeysService>("IDeleteKeysService");
    const apiKey: APIKey = {
      id: id,
      status: APIKeyStatus.Active,
      key: key,
      secretKey: "",
      name: "",
      userId,
      createdBy: loginUser.email,
      createdAt: new Date(),
      lastModifiedBy: loginUser.email,
      lastModifiedAt: new Date(),
    };
    const result = await deleteKeysService.deleteKey(loginUser, apiKey);
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
  // Update API key
  try {
    const { id, name, userId, key, status } = await request.json();
    const loginUser = await _getValidLoginUser();
    const updateKeysService =
      container.get<IUpdateKeysService>("IUpdateKeysService");
    const apiKey: APIKey = {
      id,
      name,
      key,
      secretKey: "",
      status,
      lastModifiedBy: loginUser.email,
      userId,
      createdBy: loginUser.email,
      createdAt: new Date(),
      lastModifiedAt: new Date(),
    };
    const result = await updateKeysService.updateKey(loginUser, apiKey);
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
