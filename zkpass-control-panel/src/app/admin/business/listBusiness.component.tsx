/*
 * listBusiness.component.tsx
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
  FaExclamationCircle,
} from "react-icons/fa";
import { format } from "date-fns";
import { toast } from "react-toastify";
import AddBusinessComponent from "./add/addBusiness.component";
import { UserAPIStatus } from "@/backend/userApis/constants/UserApiConstants";
import { FilterUserApisPayload } from "@/backend/requests/UserApisRequestInterface";
import { UserAPI } from "@/backend/userApis/interfaces/UserApiInterface";
import { totalRowsToPage, pageToSkipTake } from "@lib/clientHelper";

export default function ListBusinessComponent() {
  const [filterStatus, setFilterStatus] = useState<UserAPIStatus>(
    UserAPIStatus.None
  );
  const [filterName, setFilterName] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [userApis, setUserApis] = useState<UserAPI[]>([]);
  const [updatedUserApi, setUpdatedUserApi] = useState<UserAPI>();

  const [fetchUserApiError, setFetchUserApiError] = useState("");
  const [deleteUserApiError, setDeleteUserApiError] = useState("");
  const [updateUserApiError, setUpdateUserApiError] = useState("");

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
    isOpen: isOpenAddUserApi,
    onOpen: onOpenAddUserApi,
    onOpenChange: onOpenChangeAddUserApi,
  } = useDisclosure();
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy");
  };
  const formatStatus = (status: UserAPIStatus): string => {
    let statusString = "";
    switch (status) {
      case UserAPIStatus.Active:
        statusString = "Active";
        break;
      case UserAPIStatus.Deactive:
        statusString = "Inactive";
        break;
      default:
        statusString = "All";
        break;
    }
    return statusString;
  };
  const fetchUserApis = async () => {
    try {
      setLoadingProcess("fetch");
      const endpoint = "/api/userApi";
      const filter: FilterUserApisPayload = {
        status: UserAPIStatus.None,
        name: "",
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
      setUserApis(responseJson.data.userApis);
      const totalPage = totalRowsToPage(responseJson.data.total);
      setTotalPage(totalPage);
    } catch (error) {
      setFetchUserApiError((error as Error).message);
    }
    setLoadingProcess("none");
  };
  const fetchFilteredUserApi = async () => {
    try {
      setLoadingProcess("fetch");
      const endpoint = "/api/userApi";
      const filter: FilterUserApisPayload = {
        status: filterStatus,
        email: filterEmail,
        name: filterName,
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
      setUserApis(filteredResponseJson.data.userApis);
      const totalPage = totalRowsToPage(filteredResponseJson.data.total);
      setTotalPage(totalPage);
    } catch (error) {
      setFetchUserApiError((error as Error).message);
    }
    setLoadingProcess("none");
  };
  const fetchDeleteUserApi = async (closeModal: any) => {
    setLoadingProcess("delete");
    try {
      setDeleteUserApiError("");
      const endpoint = "/api/userApi";
      const payload = {
        id: updatedUserApi?.id,
        email: updatedUserApi?.email,
      };
      const response = await fetch(endpoint, {
        body: JSON.stringify(payload),
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      if (responseJson.error) {
        throw new Error(responseJson.error);
      } else {
        toast.success(`Business deactivated!`);
        closeModal();
        fetchUserApis();
        setUpdatedUserApi(undefined);
      }
    } catch (error) {
      setDeleteUserApiError((error as Error).message);
      toast.error("Something went wrong!");
    }
    setLoadingProcess("none");
  };
  const onAddUserApiComplete = async (onCloseAddUserApi: () => void) => {
    onCloseAddUserApi();
    await fetchUserApis();
  };

  const fetchUpdateUserApi = async () => {
    setUpdateUserApiError("");
    const endpoint = "/api/userApi";
    const payload = {
      id: updatedUserApi?.id,
      name: updatedUserApi?.name,
      email: updatedUserApi?.email,
      status: updatedUserApi?.status,
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

  const updateUserApi = async (closeModal: any) => {
    try {
      setLoadingProcess("update");
      await fetchUpdateUserApi();
      toast.success("Success Updating Business");
      closeModal();
      fetchUserApis();
    } catch (error) {
      setUpdateUserApiError((error as Error).message);
      toast.error("Failed Updating Business!");
    }
    setLoadingProcess("none");
  };

  const changeStatusUpdatedUserApi = (isSelected: boolean) => {
    if (updatedUserApi) {
      setUpdatedUserApi({
        ...updatedUserApi,
        status: isSelected ? UserAPIStatus.Active : UserAPIStatus.Deactive,
      });
    }
  };

  useEffect(() => {
    fetchUserApis();
  }, []);

  useEffect(() => {
    fetchFilteredUserApi();
  }, [currentPage]);

  return (
    <>
      <div className='w-5/6 flex flex-col gap-4'>
        <h1 className='mt-3 text-2xl font-extrabold tracking-tight text-slate-100'>
          List Business
        </h1>
        <div className='flex flex-row justify-between gap-4'>
          <div className='flex flex-row items-center justify-start gap-3 w-5/6'>
            <Input
              size='sm'
              className='h-full w-2/3'
              placeholder='Filter by business name'
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
                  onClick={() => setFilterStatus(UserAPIStatus.None)}
                >
                  All
                </DropdownItem>
                <DropdownItem
                  key='active'
                  onClick={() => setFilterStatus(UserAPIStatus.Active)}
                >
                  Active
                </DropdownItem>
                <DropdownItem
                  key='Deactivate'
                  onClick={() => setFilterStatus(UserAPIStatus.Deactive)}
                >
                  Inactive
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              className='h-12'
              color='primary'
              onClick={() => {
                fetchFilteredUserApi();
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
            onClick={onOpenAddUserApi}
            isDisabled={loadingProcess === "fetch"}
          >
            Add New Business
          </Button>
        </div>
        {fetchUserApiError && (
          <div className='w-full mx-auto'>
            <p className='text-red-500'>Error : {fetchUserApiError}</p>
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
            <TableColumn key='business-email' align='start'>
              Business Email
            </TableColumn>
            <TableColumn key='business-name' align='start'>
              Name
            </TableColumn>
            <TableColumn key='business-status' align='start'>
              Status
            </TableColumn>
            <TableColumn key='history' align='center'>
              <div className='w-full flex justify-center items-center'>
                History
              </div>
            </TableColumn>
            <TableColumn key='action' align='center'>
              Action
            </TableColumn>
          </TableHeader>
          <TableBody items={userApis}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p>{item.email}</p>
                </TableCell>
                <TableCell>
                  <p>{item.name}</p>
                </TableCell>
                <TableCell>
                  <p>
                    {item.status === UserAPIStatus.Active
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
                          setUpdatedUserApi(item);
                          setUpdateUserApiError("");
                          onOpenUpdate();
                        }}
                      >
                        <FaEdit />
                      </span>
                    </Tooltip>
                    {item.status === UserAPIStatus.Active && (
                      <Tooltip color='danger' content='Deactivate Business'>
                        <span
                          className={`text-lg text-danger cursor-pointer active:opacity-50`}
                          onClick={() => {
                            setUpdatedUserApi(item);
                            setDeleteUserApiError("");
                            onOpenDelete();
                          }}
                        >
                          <FaTrash />
                        </span>
                      </Tooltip>
                    )}
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
                Update Business
              </ModalHeader>
              <ModalBody>
                <Input
                  defaultValue={updatedUserApi?.email}
                  label='Business Email'
                  isDisabled
                />
                <Input
                  value={updatedUserApi?.name}
                  label='Business Name'
                  onChange={(e) =>
                    setUpdatedUserApi({
                      ...updatedUserApi!,
                      name: e.target.value,
                    })
                  }
                />
                <Checkbox
                  isSelected={updatedUserApi?.status === UserAPIStatus.Active}
                  onValueChange={changeStatusUpdatedUserApi}
                  className='self-end'
                >
                  Is Active ?
                </Checkbox>
                {updateUserApiError.length > 0 && (
                  <p className='text-red-500'>Error : {updateUserApiError}</p>
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
                  onPress={() => updateUserApi(onClose)}
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
                Deactivate Business
              </ModalHeader>
              <ModalBody>
                <p>You are about to deactivate Business :</p>
                <Input
                  type='text'
                  isDisabled
                  value={updatedUserApi?.email || ""}
                  label='Business Email'
                />
                <Input
                  type='text'
                  isDisabled
                  value={updatedUserApi?.name || ""}
                  label='Business Name'
                />
                {deleteUserApiError.length > 0 && (
                  <p className='text-red-500'>Error : {deleteUserApiError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='bordered' onPress={onCloseDelete}>
                  Cancel
                </Button>
                <Button
                  color='danger'
                  onPress={() => fetchDeleteUserApi(onCloseDelete)}
                  isLoading={loadingProcess === "delete"}
                >
                  Deactivate
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenAddUserApi}
        onOpenChange={onOpenChangeAddUserApi}
        className='dark text-foreground'
      >
        <ModalContent>
          {(onCloseAddUserApi) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Add Business
              </ModalHeader>
              <ModalBody>
                <AddBusinessComponent
                  isModal={true}
                  closeModal={onCloseAddUserApi}
                  onComplete={() => onAddUserApiComplete(onCloseAddUserApi)}
                />
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
