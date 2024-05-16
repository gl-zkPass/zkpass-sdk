/*
 * addKeys.component.tsx
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: January 19th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
"use client";
import { PaginationDefault } from "@/backend/keys/constants/KeysConstants";
import { FilterUserApisPayload } from "@/backend/requests/UserApisRequestInterface";
import { UserAPIStatus } from "@/backend/userApis/constants/UserApiConstants";
import { UserAPI } from "@/backend/userApis/interfaces/UserApiInterface";
import { isValidEmailFormat } from "@lib/clientHelper";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AddKeysComponent({
  isModal,
  closeModal,
  onComplete,
}: {
  isModal?: boolean;
  closeModal: any;
  onComplete?: () => void;
}) {
  const [userApis, setUserApis] = useState<UserAPI[]>([]);
  const [choosenUserApi, setChoosenUserApi] = useState<UserAPI>();
  const [name, setName] = useState<string>("");
  const [userApiEmail, setUserApiEmail] = useState<string>();
  const [loadingFetch, setLoadingFetch] = useState<boolean>(true);
  const [loadingAdd, setLoadingAdd] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchUserApis = async () => {
    try {
      setError("");
      const endpoint = "/api/userApi";
      const filter: FilterUserApisPayload = {
        status: UserAPIStatus.Active,
        name: "",
        email: "",
      };
      const payload = {
        skip: PaginationDefault.Skip,
        take: 100,
        filter,
      };
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.error);
      }
      setUserApis(responseJson.data.userApis);
      setLoadingFetch(false);
    } catch (error) {
      setError((error as Error).message);
      toast.error("Something went wrong!");
    }
  };

  const createNewKey = async () => {
    try {
      setLoadingAdd(true);
      const email = userApiEmail || choosenUserApi?.email;
      if (!email || !isValidEmailFormat(email)) {
        throw new Error("Email incorrect");
      }
      await fetchAddKey();
    } catch (error) {
      setError((error as Error).message);
      toast.error("Something went wrong!");
    }
    setLoadingAdd(false);
  };

  const fetchAddKey = async () => {
    if (!name) {
      throw new Error("Input incorrect");
    }
    const endpoint = "/api/keys";
    const payload = {
      email: userApiEmail,
      apiName: name,
    };

    const response = await fetch(endpoint, {
      body: JSON.stringify(payload),
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.error);
    } else {
      toast.success("New keys added!");
      onComplete && onComplete();
    }
  };

  const filterUserApi = (key: string | undefined) => {
    if (key) {
      let filteredUser = userApis.filter(
        (user) => user.id === parseInt(key)
      )[0];
      setChoosenUserApi(filteredUser);
      setUserApiEmail(filteredUser.email);
    }
  };

  useEffect(() => {
    fetchUserApis();
  }, []);

  return (
    <>
      <div className={isModal ? "w-full" : "w-1/2"}>
        <Card>
          {!isModal && (
            <CardHeader className='justify-center'>Add Keys</CardHeader>
          )}
          <CardBody>
            <div className='flex flex-col gap-2 items-center'>
              <Input
                type='text'
                label='API key name'
                variant='bordered'
                className='w-full'
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
              <Autocomplete
                label='Business Email'
                placeholder='Please pick the new API Key holder (email)'
                className='w-full'
                defaultItems={userApis}
                onSelectionChange={(key) => {
                  filterUserApi(key ? key.toString() : undefined);
                }}
                value={userApiEmail}
                onValueChange={(e) => {
                  setUserApiEmail(e);
                }}
                allowsCustomValue={true}
              >
                {(userApis) => (
                  <AutocompleteItem key={userApis.id}>
                    {`${userApis.email}`}
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>
          </CardBody>
          <CardFooter>
            <div className='flex flex-col w-full items-center'>
              {error && (
                <div className='w-full mb-5'>
                  <p className='text-red-500'>Error : {error}</p>
                </div>
              )}
              <div className='w-full flex flex-row justify-center gap-1'>
                <Button variant='bordered' onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isDisabled={
                    loadingFetch || loadingAdd || !name || !userApiEmail
                  }
                  onClick={createNewKey}
                  isLoading={loadingAdd}
                >
                  Generate
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
