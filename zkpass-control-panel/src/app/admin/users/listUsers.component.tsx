/*
 * listKeys.component.tsx
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 6th 2023
 * -----
 * Last Modified: January 18th 2024
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
import { UserRole, UserStatus } from "@users/constants/UsersConstants";
import {
  Button,
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
  Select,
  SelectItem,
  Spinner,
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
import { User } from "@users/interfaces/UsersInterfaces";
import { format } from "date-fns";
import { FilterUsersPayload } from "@requests/UsersRequestInterface";
import { toast } from "react-toastify";
import { totalRowsToPage, pageToSkipTake } from "@lib/clientHelper";
import { useSession } from "next-auth/react";

export default function ListUsersComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  const [filterRole, setFilterRole] = useState<UserRole>(UserRole.None);
  const [filterStatus, setFilterStatus] = useState<UserStatus>(UserStatus.None);
  const [filterName, setFilterName] = useState("");
  const [users, setUsers] = useState<User[]>([]);

  const [addUserName, setAddUserName] = useState("");
  const [addUserEmail, setAddUserEmail] = useState("");
  const [addUserError, setAddUserError] = useState("");

  const [updateUserName, setUpdateUserName] = useState("");
  const [updateUserEmail, setUpdateUserEmail] = useState("");
  const [updateUserStatus, setUpdateUserStatus] = useState<UserStatus>(
    UserStatus.None
  );
  const [updateUserId, setUpdateUserId] = useState(0);

  const [editUserError, setEditUserError] = useState("");
  const [deleteUserError, setDeleteUserError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isFetchLoading, setIsFetchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isOpenDelete,
    onOpen: onOpenDelete,
    onOpenChange: onOpenChangeDelete,
  } = useDisclosure();
  const {
    isOpen: isOpenAddUser,
    onOpen: onOpenAddUser,
    onOpenChange: onOpenChangeAddUser,
  } = useDisclosure();
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return format(date, "dd MMM yyyy HH:mm:ss");
  };
  const formatRole = (role: UserRole): string => {
    let roleString = "";
    switch (role) {
      case UserRole.Root:
        roleString = "Root";
        break;
      case UserRole.Admin:
        roleString = "Admin";
        break;
      default:
        roleString = "All";
        break;
    }
    return roleString;
  };
  const formatStatus = (status: UserStatus): string => {
    let statusString = "";
    switch (status) {
      case UserStatus.Active:
        statusString = "Active";
        break;
      case UserStatus.Deactive:
        statusString = "Inactive";
        break;
      default:
        statusString = "All";
        break;
    }
    return statusString;
  };
  const fetchUsers = async () => {
    try {
      const endpoint = "/api/users";
      const filter: FilterUsersPayload = {
        status: UserStatus.None,
        name: "",
        email: "",
        role: undefined,
      };
      setFilterRole(UserRole.None);
      setFilterStatus(UserStatus.None);
      setFilterName("");
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
      setIsLoading(false);
      setUsers(responseJson.data.users);
      const totalPage = totalRowsToPage(responseJson.data.total);
      setTotalPage(totalPage);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const fetchFilteredUsers = async () => {
    setIsFetchLoading(true);

    try {
      const endpoint = "/api/users";
      const filter: FilterUsersPayload = {
        status: filterStatus,
        name: filterName,
        email: filterName,
        role: filterRole == UserRole.None ? undefined : filterRole,
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
      setIsLoading(false);
      setUsers(filteredResponseJson.data.users);
      const totalPage = totalRowsToPage(filteredResponseJson.data.total);
      setTotalPage(totalPage);
    } catch (error) {}

    setIsFetchLoading(false);
  };
  const fetchAddUser = async (closeModal: any) => {
    setIsFetchLoading(true);
    setAddUserError("");

    try {
      const endpoint = "/api/users";
      const payload = {
        email: addUserEmail,
        name: addUserName,
        role: UserRole.Admin,
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
        setAddUserError(responseJson.error);
      } else {
        toast.success("New user added!");
        closeModal();
        fetchUsers();
      }
    } catch (error) {
      toast.error("Something went wrong!");
      closeModal();
    }

    setIsFetchLoading(false);
  };
  const fetchDeleteUser = async (closeModal: any) => {
    setIsFetchLoading(true);
    setDeleteUserError("");

    try {
      const endpoint = "/api/users";
      const payload = {
        email: updateUserEmail,
        user_id: updateUserId,
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
        setDeleteUserError(responseJson.error);
      } else {
        const { data } = responseJson;
        if (data) {
          toast.success("User deleted!");
        } else {
          toast.error("Failed deleting user!");
        }
        closeModal();
        fetchUsers();
      }
    } catch (error) {
      toast.error("Something went wrong!");
      closeModal();
    }

    setIsFetchLoading(false);
  };
  const fetchEditUser = async (closeModal: any) => {
    setIsFetchLoading(true);
    setEditUserError("");

    try {
      const endpoint = "/api/users";
      const payload = {
        email: updateUserEmail,
        name: updateUserName,
        status: updateUserStatus,
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
        setEditUserError(responseJson.error);
      } else {
        const { data } = responseJson;
        if (data) {
          toast.success("User data updated!");
        } else {
          toast.error("Failed updating user!");
        }
        closeModal();
        fetchUsers();
      }
    } catch (error) {
      toast.error("Something went wrong!");
      closeModal();
    }

    setIsFetchLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchFilteredUsers();
  }, [currentPage]);
  return (
    <>
      <div className='w-5/6 flex flex-col gap-4'>
        <h1 className='mt-3 text-2xl font-extrabold tracking-tight text-slate-100'>
          List Users
        </h1>
        <div className='flex flex-row justify-between gap-4'>
          <div className='flex flex-row items-center justify-start gap-3 w-5/6'>
            <Input
              size='sm'
              className='h-full w-2/3'
              placeholder='Filter by name'
              onChange={(e) => setFilterName(e.target.value)}
              startContent={<FaSearch />}
            />
            <Dropdown className='dark text-foreground'>
              <DropdownTrigger>
                <Button
                  className='h-12 w-40'
                  startContent={
                    <>
                      <FaFilter /> Role :{" "}
                    </>
                  }
                  variant='flat'
                  color='primary'
                >
                  {formatRole(filterRole)}
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='Filter Role'>
                <DropdownItem
                  key='none'
                  onClick={() => setFilterRole(UserRole.None)}
                >
                  All
                </DropdownItem>
                <DropdownItem
                  key='root'
                  onClick={() => setFilterRole(UserRole.Root)}
                >
                  Root
                </DropdownItem>
                <DropdownItem
                  key='admin'
                  onClick={() => setFilterRole(UserRole.Admin)}
                >
                  Admin
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Dropdown className='dark text-foreground'>
              <DropdownTrigger>
                <Button
                  className='h-12 w-48'
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
                  onClick={() => setFilterStatus(UserStatus.None)}
                >
                  All
                </DropdownItem>
                <DropdownItem
                  key='active'
                  onClick={() => setFilterStatus(UserStatus.Active)}
                >
                  Active
                </DropdownItem>
                <DropdownItem
                  key='deactive'
                  onClick={() => setFilterStatus(UserStatus.Deactive)}
                >
                  Inactive
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <Button
              isLoading={isFetchLoading}
              className='h-12'
              color='primary'
              onClick={() => {
                setCurrentPage(1);
                fetchFilteredUsers();
              }}
            >
              {isFetchLoading ? "Loading.." : "Filter"}
            </Button>
          </div>
          <Button
            className='h-12'
            variant='bordered'
            startContent={<FaPlus />}
            onClick={onOpenAddUser}
          >
            Add New User
          </Button>
        </div>
        <Table
          aria-label='Example table with custom cells'
          bottomContent={
            !isLoading &&
            users.length > 0 && (
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
            )
          }
        >
          <TableHeader>
            <TableColumn key='api-key' align='start'>
              Email
            </TableColumn>
            <TableColumn key='business-name' align='start'>
              Name
            </TableColumn>
            <TableColumn key='role' align='center'>
              Role
            </TableColumn>
            <TableColumn key='status' align='center'>
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
          <TableBody
            items={users}
            emptyContent={!isLoading && "User not found."}
            isLoading={isLoading}
            loadingContent={<Spinner />}
          >
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p>{item.email}</p>
                </TableCell>
                <TableCell>
                  <p>{item.name}</p>
                </TableCell>
                <TableCell>
                  <p>{formatRole(item.role)}</p>
                </TableCell>
                <TableCell>
                  <p>{formatStatus(item.status)}</p>
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
                    <Tooltip content='Edit user'>
                      <span
                        className='text-lg text-default-400 cursor-pointer active:opacity-50'
                        onClick={() => {
                          setUpdateUserId(item.id);
                          setUpdateUserName(item.name);
                          setUpdateUserEmail(item.email);
                          setUpdateUserStatus(item.status);
                          onOpen();
                        }}
                      >
                        <FaEdit />
                      </span>
                    </Tooltip>

                    {item.status != UserStatus.Deactive &&
                      item.role != UserRole.Root &&
                      item.email != session?.user?.email && (
                        <Tooltip color='danger' content='Delete User'>
                          <span
                            className='text-lg text-danger cursor-pointer active:opacity-50'
                            onClick={() => {
                              setUpdateUserId(item.id);
                              setUpdateUserName(item.name);
                              setUpdateUserEmail(item.email);
                              setUpdateUserStatus(item.status);
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
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className='dark text-foreground'
        isDismissable={false}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Edit User
              </ModalHeader>
              <ModalBody>
                <Input
                  defaultValue={updateUserEmail}
                  label='Email'
                  isReadOnly
                />
                <Input
                  defaultValue={updateUserName}
                  label='Name'
                  onChange={(e) => setUpdateUserName(e.target.value)}
                />
                <Select
                  label='Status'
                  disabledKeys={
                    updateUserStatus == UserStatus.Deactive ? ["deactive"] : []
                  }
                  onChange={() => setEditUserError("")}
                  defaultSelectedKeys={
                    updateUserStatus == UserStatus.Deactive
                      ? ["deactive"]
                      : ["active"]
                  }
                >
                  <SelectItem
                    key='active'
                    value={UserStatus.Active}
                    onClick={() => setUpdateUserStatus(UserStatus.Active)}
                  >
                    {formatStatus(UserStatus.Active)}
                  </SelectItem>

                  <SelectItem
                    key='deactive'
                    value={UserStatus.Deactive}
                    onClick={() => setUpdateUserStatus(UserStatus.Deactive)}
                  >
                    {formatStatus(UserStatus.Deactive)}
                  </SelectItem>
                </Select>
                {editUserError.length > 0 && (
                  <p className='text-red-500'>Error : {editUserError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='bordered' onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color='primary'
                  onPress={() => fetchEditUser(onClose)}
                  isLoading={isFetchLoading}
                >
                  {isFetchLoading ? "Saving.." : "Save"}
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
                Delete User
              </ModalHeader>
              <ModalBody>
                <p>You are about to delete User :</p>
                <Input
                  type='text'
                  isReadOnly
                  value={updateUserEmail}
                  label='Email'
                />
                <Input
                  type='text'
                  isReadOnly
                  value={updateUserName}
                  label='Name'
                />
                {deleteUserError.length > 0 && (
                  <p className='text-red-500'>Error : {deleteUserError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='bordered' onPress={onCloseDelete}>
                  Cancel
                </Button>
                <Button
                  isLoading={isFetchLoading}
                  color='danger'
                  onPress={() => fetchDeleteUser(onCloseDelete)}
                >
                  {isFetchLoading ? "Deleting..." : "Delete"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isOpenAddUser}
        onOpenChange={onOpenChangeAddUser}
        className='dark text-foreground'
      >
        <ModalContent>
          {(onCloseAddUser) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                Add User
              </ModalHeader>
              <ModalBody>
                <Input
                  label='Email'
                  onChange={(e) => {
                    setAddUserEmail(e.target.value);
                    setAddUserError("");
                  }}
                />
                <Input
                  label='Name'
                  onChange={(e) => {
                    setAddUserName(e.target.value);
                    setAddUserError("");
                  }}
                />
                {addUserError.length > 0 && (
                  <p className='text-red-500'>Error : {addUserError}</p>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant='bordered' onPress={onCloseAddUser}>
                  Cancel
                </Button>
                <Button
                  isLoading={isFetchLoading}
                  color='primary'
                  onPress={async () => {
                    await fetchAddUser(onCloseAddUser);
                  }}
                >
                  {isFetchLoading ? "Adding user.." : "Add User"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
