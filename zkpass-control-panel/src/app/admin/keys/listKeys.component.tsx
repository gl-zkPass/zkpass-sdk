/*
 * listKeys.component.tsx
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
import {
  Button,
  Checkbox,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import {
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCopy,
  FaExclamationCircle,
} from "react-icons/fa";
import { VscLayersActive } from "react-icons/vsc";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { APIKeyStatus } from "@/backend/keys/constants/KeysConstants";
import { APIKey } from "@/backend/keys/interfaces/KeysInterface";
import { FilterKeysPayload } from "@/backend/requests/KeysRequestInterface";
import AddKeysComponent from "./add/addKeys.component";
import { totalRowsToPage, pageToSkipTake } from "@lib/clientHelper";

export default function ListKeysComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filterStatus, setFilterStatus] = useState<APIKeyStatus>(
    APIKeyStatus.None
  );
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);

  const [updatedApiKey, setUpdatedApiKey] = useState<APIKey>();
  const [fetchApiKeysError, setFetchApiKeysError] = useState("");
  const [updateApiKeyError, setUpdateApiKeyError] = useState("");
  const [updateStatusApiKeyError, setUpdateStatusApiKeyError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const [loadingProcess, setLoadingProcess] = useState<
    "none" | "delete" | "update" | "fetch"
  >("none");
  const {
    isOpen: isOpenUpdate,
    onOpen: onOpenUpdate,
    onOpenChange: onOpenChangeUpdate,
  } = useDisclosure();
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure();
  const {
    isOpen: isOpenAddApiKey,
    onOpen: onOpenAddApiKey,
    onOpenChange: onOpenChangeAddApiKey,
  } = useDisclosure();
  const formatDateToolTip = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy HH:mm:ss");
  };
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy");
  };
  const formatStatus = (status: APIKeyStatus): string => {
    let statusString = "";
    switch (status) {
      case APIKeyStatus.Active:
        statusString = "Active";
        break;
      case APIKeyStatus.Deactive:
        statusString = "Inactive";
        break;
      default:
        statusString = "All";
        break;
    }
    return statusString;
  };
  const fetchApiKeys = async () => {
    try {
      setLoadingProcess("fetch");
      const endpoint = "/api/keys";
      const filter: FilterKeysPayload = {
        status: APIKeyStatus.None,
        apiKeyName: "",
        email: "",
      };
      const { skip, take } = pageToSkipTake(currentPage);
      const payload = {
        skip,
        take,
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
      setApiKeys(responseJson.data.apiKeys);
      const totalPage = totalRowsToPage(responseJson.data.total);
      setTotalPage(totalPage);
    } catch (error) {
      setFetchApiKeysError((error as Error).message);
    }
    setLoadingProcess("none");
  };
  const fetchFilteredApiKeys = async () => {
    try {
      setLoadingProcess("fetch");
      const endpoint = "/api/keys";
      const filter: FilterKeysPayload = {
        status: filterStatus,
        apiKeyName: filterName,
        email: filterEmail,
      };
      const { skip, take } = pageToSkipTake(currentPage);
      const payload = {
        skip,
        take,
        filter,
      };
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const filteredResponseJson = await response.json();
      if (filteredResponseJson.error) {
        throw new Error(filteredResponseJson.error);
      }
      setApiKeys(filteredResponseJson.data.apiKeys);
      const totalPage = totalRowsToPage(filteredResponseJson.data.total);
      setTotalPage(totalPage);
    } catch (error) {
      setFetchApiKeysError((error as Error).message);
    }
    setLoadingProcess("none");
  };
  const fetchUpdateStatusApiKey = async (closeModal: any) => {
    setLoadingProcess("delete");
    try {
      setUpdateStatusApiKeyError("");
      const endpoint = "/api/keys";
      const payload = {
        id: updatedApiKey?.id,
        userId: updatedApiKey?.userId,
        key: updatedApiKey?.key,
        name: updatedApiKey?.name,
        status:
          updatedApiKey?.status === APIKeyStatus.Active
            ? APIKeyStatus.Deactive
            : APIKeyStatus.Active,
      };
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.error);
      } else {
        const { data } = responseJson;
        if (data) {
          const status =
            updatedApiKey?.status === APIKeyStatus.Active
              ? "deactivated"
              : "activated";
          toast.success(`Api Key ${status}!`);
        } else {
          toast.error("Failed change status Api Key!");
        }
        closeModal();
        fetchApiKeys();
        setUpdatedApiKey(undefined);
      }
    } catch (error) {
      setUpdateStatusApiKeyError((error as Error).message);
      toast.error("Something went wrong!");
    }
    setLoadingProcess("none");
  };
  const onAddKeyComplete = async (onCloseAddUser: () => void) => {
    onCloseAddUser();
    await fetchApiKeys();
  };

  const fetchUpdateApiKey = async () => {
    setUpdateApiKeyError("");
    const endpoint = "/api/keys";
    const payload = {
      id: updatedApiKey?.id,
      user_id: updatedApiKey?.userId,
      key: updatedApiKey?.key,
      name: updatedApiKey?.name,
      status: updatedApiKey?.status,
    };
    const response = await fetch(endpoint, {
      body: JSON.stringify(payload),
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.error);
    }
  };

  const updateApiKey = async (closeModal: any) => {
    try {
      setLoadingProcess("update");
      await fetchUpdateApiKey();
      toast.success("Success Updating Api Key!");
      closeModal();
      fetchApiKeys();
    } catch (error) {
      setUpdateApiKeyError((error as Error).message);
      toast.error("Something went wrong!");
    }
    setLoadingProcess("none");
  };

  const changeStatusUpdatedApiKey = (isSelected: boolean) => {
    if (updatedApiKey) {
      setUpdatedApiKey({
        ...updatedApiKey,
        status: isSelected ? APIKeyStatus.Active : APIKeyStatus.Deactive,
      });
    }
  };

  const onCopyFeature = async (text_to_copy: string) => {
    try {
      await navigator.clipboard.writeText(text_to_copy);
      toast.success("Success copied text!");
    } catch (err) {
      toast.error(`Failed to copy text: ${err}`);
    }
  };

  const trimText = (input: string, maxLength = 12): string => {
    console.log("start trim");
    if (input.length > maxLength) {
      const trimmedString = input.substring(0, maxLength);
      console.log({ trimmedString });
      return input.substring(0, maxLength) + "...";
    }

    return input;
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  useEffect(() => {
    fetchFilteredApiKeys();
  }, [currentPage]);

  return (
    <>
      <div className='w-5/6 flex flex-col gap-4'>
        <h1 className='mt-3 text-2xl font-extrabold tracking-tight text-slate-100'>
          List Keys
        </h1>
        <div className='flex flex-row justify-between gap-4'>
          <div className='flex flex-row items-center justify-start gap-3 w-5/6'>
            <Input
              size='sm'
              className='h-full w-2/3'
              placeholder='Filter by api key name'
              onChange={(e) => setFilterName(e.target.value)}
              startContent={<FaSearch />}
            />
            <Input
              size='sm'
              className='h-full w-2/3'
              placeholder='Filter by business email'
              onChange={(e) => setFilterEmail(e.target.value)}
              startContent={<FaSearch />}
            />
            <Dropdown className='dark text-foreground'>
              <DropdownTrigger>
                <Button
                  className='h-12 w-64'
                  startContent={
                    <>
                      <FaFilter /> Status :{" "}
                    </>
                  }
                  variant='flat'
                  color='primary'
                >
                  {formatStatus(filterStatus)}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Filter Status'>
                <DropdownItem
                  key='none'
                  onClick={() => setFilterStatus(APIKeyStatus.None)}
                >
                  All
                </DropdownItem>
                <DropdownItem
                  key='active'
                  onClick={() => setFilterStatus(APIKeyStatus.Active)}
                >
                  Active
                </DropdownItem>
                <DropdownItem
                  key='Deactivate'
                  onClick={() => setFilterStatus(APIKeyStatus.Deactive)}
                >
                  Inactive
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              className='h-12'
              color='primary'
              onClick={() => {
                fetchFilteredApiKeys();
                setCurrentPage(1);
              }}
              isLoading={loadingProcess === "fetch"}
            >
              Filter
            </Button>
          </div>
          <Button
            className='h-12'
            variant='bordered'
            startContent={<FaPlus />}
            onClick={onOpenAddApiKey}
            isDisabled={loadingProcess === "fetch"}
          >
            Generate Api Keys
          </Button>
        </div>
        {fetchApiKeysError && (
          <div className='w-full mx-auto'>
            <p className='text-red-500'>Error : {fetchApiKeysError}</p>
          </div>
        )}
        <Table
          aria-label='Example table with custom cells'
          bottomContent={
            <div className='w-full flex flex-row justify-center'>
              <Pagination
                showControls
                total={totalPage}
                page={currentPage}
                onChange={(page) => {
                  setCurrentPage(page);
                }}
              />
            </div>
          }
        >
          <TableHeader>
            <TableColumn key='api-key-name' align='start'>
              Name
            </TableColumn>
            <TableColumn key='api-key' align='start'>
              Api Key
            </TableColumn>
            <TableColumn key='secret-api-key' align='start'>
              Secret Api Key
            </TableColumn>
            <TableColumn key='api-key-token' align='start'>
              API Token
            </TableColumn>
            <TableColumn key='business-email' align='start'>
              Business Email
            </TableColumn>
            <TableColumn key='key-status' align='start'>
              Status
            </TableColumn>
            <TableColumn key='history' align='start'>
              <div className='w-full flex justify-center items-center'>
                History
              </div>
            </TableColumn>
            <TableColumn key='action' align='center'>
              Action
            </TableColumn>
          </TableHeader>
          <TableBody items={apiKeys}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p>{item.name}</p>
                </TableCell>
                <TableCell>
                  <span className='flex flex-row justify-between'>
                    <p>{trimText(item.key)}</p>
                    <Tooltip content='Copy Api Key'>
                      <span
                        className='cursor-pointer pe-2'
                        onClick={() => onCopyFeature(item.key)}
                      >
                        <FaCopy />
                      </span>
                    </Tooltip>
                  </span>
                </TableCell>
                <TableCell>
                  <span className='flex flex-row justify-between'>
                    <p>{trimText(item.secretKey)}</p>
                    <Tooltip content='Copy Secret Api Key'>
                      <span
                        className='cursor-pointer pe-2'
                        onClick={() => onCopyFeature(item.secretKey)}
                      >
                        <FaCopy />
                      </span>
                    </Tooltip>
                  </span>
                </TableCell>
                <TableCell>
                  <span className='flex flex-row justify-between'>
                    <p>{trimText(btoa(`${item.key}:${item.secretKey}`))}</p>
                    <Tooltip content='Copy API Token'>
                      <span
                        className='cursor-pointer pe-2'
                        onClick={() =>
                          onCopyFeature(btoa(`${item.key}:${item.secretKey}`))
                        }
                      >
                        <FaCopy />
                      </span>
                    </Tooltip>
                  </span>
                </TableCell>
                <TableCell>
                  <p>{item.user?.email}</p>
                </TableCell>
                <TableCell>
                  <p>
                    {item.status === APIKeyStatus.Active
                      ? "Active"
                      : "Inactive"}
                  </p>
                </TableCell>
                <TableCell>
                  <div className='w-full flex justify-center items-center'>
                    <Tooltip
                      content={
                        <div>
                          <span className='flex flex-row gap-1'>
                            <p className='font-bold'>Created At :</p>{" "}
                            {formatDate(item.createdAt.toString())}
                          </span>
                          <span className='flex flex-row gap-1'>
                            <p className='font-bold'>Created By :</p>{" "}
                            {item.createdBy}
                          </span>
                          <span className='flex flex-row gap-1'>
                            <p className='font-bold'>Last Modified At :</p>{" "}
                            {formatDate(item.lastModifiedAt.toString())}
                          </span>
                          <span className='flex flex-row gap-1'>
                            <p className='font-bold'>Last Modified By :</p>{" "}
                            {item.lastModifiedBy}
                          </span>
                        </div>
                      }
                    >
                      <span className='text-lg text-default-400 cursor-pointer active:opacity-50'>
                        <FaExclamationCircle />
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
                <TableCell>
                  <div className='relative flex items-center gap-2'>
                    <Tooltip content='Change status'>
                      <span
                        className='text-lg text-default-400 cursor-pointer active:opacity-50'
                        onClick={() => {
                          setUpdatedApiKey(item);
                          setUpdateApiKeyError("");
                          onOpenUpdate();
                        }}
                      >
                        <FaEdit />
                      </span>
                    </Tooltip>
                    <Tooltip
                      color={
                        item.status === APIKeyStatus.Active
                          ? "danger"
                          : "success"
                      }
                      content={
                        item.status === APIKeyStatus.Active
                          ? "Deactivate Api Key"
                          : "Reactivate Api Key"
                      }
                    >
                      <span
                        className={`text-lg ${
                          item.status === APIKeyStatus.Active
                            ? "text-danger"
                            : "text-success"
                        } cursor-pointer active:opacity-50`}
                        onClick={() => {
                          setUpdatedApiKey(item);
                          setUpdateStatusApiKeyError("");
                          onOpenDelete();
                        }}
                      >
                        {item.status === APIKeyStatus.Active ? (
                          <FaTrash />
                        ) : (
                          <VscLayersActive />
                        )}
                      </span>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Modal
        isOpen={isOpenUpdate}
        onOpenChange={onOpenChangeUpdate}
        className='dark text-foreground'
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Update Api Key
              </ModalHeader>
              <ModalBody>
                <Input
                  defaultValue={updatedApiKey?.user?.email}
                  label='Business Email'
                  isDisabled
                />
                <Input
                  value={updatedApiKey?.name}
                  label='Api Key Name'
                  onChange={(e) =>
                    setUpdatedApiKey({
                      ...updatedApiKey!,
                      name: e.target.value,
                    })
                  }
                />

                <Checkbox
                  isSelected={updatedApiKey?.status === APIKeyStatus.Active}
                  onValueChange={changeStatusUpdatedApiKey}
                  className='self-end'
                >
                  Is Active ?
                </Checkbox>
                {updateApiKeyError.length > 0 && (
                  <p className='text-red-500'>Error : {updateApiKeyError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant='bordered'
                  onPress={onClose}
                  isDisabled={loadingProcess === "update"}
                >
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={() => updateApiKey(onClose)}
                  isDisabled={loadingProcess === "update"}
                  isLoading={loadingProcess === "update"}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenDelete}
        onOpenChange={onOpenChangeDelete}
        className='dark text-foreground'
      >
        <ModalContent>
          {(onCloseDelete) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                {updatedApiKey?.status === APIKeyStatus.Active
                  ? "Deactivate"
                  : "Reactivate"}{" "}
                Api Key
              </ModalHeader>
              <ModalBody>
                <p>
                  You are about to{" "}
                  {updatedApiKey?.status === APIKeyStatus.Active
                    ? "Deactivate"
                    : "Reactivate"}{" "}
                  Api Key :
                </p>
                <Input
                  type='text'
                  isDisabled
                  value={updatedApiKey?.name || ""}
                  label='Api Key Name'
                />
                <Input
                  type='text'
                  isDisabled
                  value={updatedApiKey?.key || ""}
                  label='Api Key'
                />
                <Input
                  type='text'
                  isDisabled
                  value={updatedApiKey?.user?.email || ""}
                  label='Business email'
                />
                {updateStatusApiKeyError.length > 0 && (
                  <p className='text-red-500'>
                    Error : {updateStatusApiKeyError}
                  </p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='bordered' onPress={onCloseDelete}>
                  Cancel
                </Button>
                <Button
                  color={
                    updatedApiKey?.status === APIKeyStatus.Active
                      ? "danger"
                      : "secondary"
                  }
                  onPress={() => fetchUpdateStatusApiKey(onCloseDelete)}
                  isLoading={loadingProcess === "delete"}
                >
                  {updatedApiKey?.status === APIKeyStatus.Active
                    ? "Deactivate"
                    : "Reactivate"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenAddApiKey}
        onOpenChange={onOpenChangeAddApiKey}
        className='dark text-foreground'
        isDismissable={false}
      >
        <ModalContent>
          {(onCloseAddApiKey) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Add Api Key
              </ModalHeader>
              <ModalBody>
                <AddKeysComponent
                  isModal={true}
                  closeModal={onCloseAddApiKey}
                  onComplete={() => onAddKeyComplete(onCloseAddApiKey)}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
