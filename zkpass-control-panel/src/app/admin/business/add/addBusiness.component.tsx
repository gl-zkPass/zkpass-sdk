/*
 * addBusiness.component.tsx
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created at: December 15th 2023
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
import { isValidEmailFormat } from "@lib/clientHelper";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
} from "@nextui-org/react";
import { useState } from "react";
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
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loadingAdd, setLoadingAdd] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const createNewUserApi = async () => {
    try {
      setLoadingAdd(true);
      if (!email || !isValidEmailFormat(email)) {
        throw new Error("Email incorrect");
      }
      await fetchAddUserApi();
    } catch (error) {
      setError((error as Error).message);
      toast.error("Something went wrong!");
    }
    setLoadingAdd(false);
  };

  const fetchAddUserApi = async () => {
    const endpoint = "/api/userApi";
    const payload = {
      email,
      name,
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
      toast.success("New Business added!");
      onComplete && onComplete();
    }
  };

  return (
    <>
      <div className={isModal ? "w-full" : "w-1/2"}>
        <Card>
          {!isModal && (
            <CardHeader className='justify-center'>Add Businesses</CardHeader>
          )}
          <CardBody>
            <div className='flex flex-col gap-2 items-center'>
              <Input
                type='text'
                label='Business email'
                variant='bordered'
                className='w-full'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                placeholder='Enter new business email'
              />
              <Input
                type='text'
                label='Business name'
                variant='bordered'
                className='w-full'
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                placeholder='Enter new business name'
              />
            </div>
          </CardBody>
          <CardFooter>
            <div className='fles flex-col w-full items-center'>
              {error && (
                <div className='w-3/4 mx-auto'>
                  <p className='text-red-500'>Error : {error}</p>
                </div>
              )}
              <div className='w-full flex flex-row justify-center gap-1'>
                <Button variant='bordered' onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  isDisabled={loadingAdd || !name || !email}
                  onClick={createNewUserApi}
                  isLoading={loadingAdd}
                >
                  Save
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
