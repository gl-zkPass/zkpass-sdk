/*
 * inversify.config.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
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
import "reflect-metadata";
import { Container } from "inversify";
import {
  IAddUsersService,
  IDeleteUsersService,
  IListUsersService,
  IUpdateUsersService,
} from "@users/interfaces/UsersServicesInterfaces";
import { AddUsersService } from "@users/services/AddUsersService";
import { DeleteUsersService } from "@users/services/DeleteUsersService";
import { ListUsersService } from "@users/services/ListUsersService";
import { UpdateUsersService } from "@users/services/UpdateUsersService";
import {
  IAddKeysService,
  IDeleteKeysService,
  IListKeysService,
  IUpdateKeysService,
} from "./keys/interfaces/KeysServiceInterfaces";
import { AddKeysService } from "@keys/services/AddKeysService";
import { DeleteKeysService } from "@keys/services/DeleteKeysService";
import { ListKeysService } from "@keys/services/ListKeysService";
import { UpdateKeysService } from "@keys/services/UpdateKeysService";
import { IUsersRepository } from "@users/interfaces/UsersRepoInterfaces";
import { UsersRepository } from "@users/repositories/UsersRepository";
import { KeysRepository } from "@keys/repositories/KeysRepository";
import { IKeysRepository } from "@keys/interfaces/KeysRepoInterfaces";
import { IUserApiRepository } from "@userApis/interfaces/UserApiRepoInterface";
import { UserApiRepository } from "@userApis/repositories/UserApiRepository";
import {
  IAddUserApiService,
  IDeleteUserApiService,
  IListUserApiService,
  IUpdateUserApiService,
} from "@userApis/interfaces/UserApiServiceInterfaces";
import { AddUserApiService } from "@userApis/services/AddUserApiService";
import { IQueueService } from "@messagingQueue/interfaces/IQueueService";
import { RabbitMQService } from "@messagingQueue/implementation/RabbitMQService";
import { ListUserApiService } from "@userApis/services/ListUserApiService";
import { DeleteUserApiService } from "@userApis/services/DeleteUserApiService";
import { UpdateUserApiService } from "@userApis/services/UpdateUserApiService";
import { NotifyWSService } from "@keys/services/NotifyWSService";
import { IResourcesRepository } from "@/backend/resources/interfaces/ResourcesRepoInterfaces";
import { ResourcesRepository } from "@resources/repositories/ResourcesRepository";
import { IListAPIKeyUsageService } from "@resources/interfaces/ResourcesServicesInterfaces";
import { ListAPIKeyUsageService } from "@resources/services/ListAPIKeyUsageService";

const container = new Container();

// Users services
container.bind<IAddUsersService>("IAddUsersService").to(AddUsersService);
container
  .bind<IDeleteUsersService>("IDeleteUsersService")
  .to(DeleteUsersService);
container.bind<IListUsersService>("IListUsersService").to(ListUsersService);
container
  .bind<IUpdateUsersService>("IUpdateUsersService")
  .to(UpdateUsersService);

// Keys services
container.bind<IAddKeysService>("IAddKeysService").to(AddKeysService);
container.bind<IDeleteKeysService>("IDeleteKeysService").to(DeleteKeysService);
container.bind<IListKeysService>("IListKeysService").to(ListKeysService);
container.bind<IUpdateKeysService>("IUpdateKeysService").to(UpdateKeysService);

// UserApi services
container.bind<IAddUserApiService>("IAddUserApiService").to(AddUserApiService);
container
  .bind<IListUserApiService>("IListUserApiService")
  .to(ListUserApiService);
container
  .bind<IDeleteUserApiService>("IDeleteUserApiService")
  .to(DeleteUserApiService);
container
  .bind<IUpdateUserApiService>("IUpdateUserApiService")
  .to(UpdateUserApiService);

// Users repositories
container.bind<IUsersRepository>("IUsersRepository").to(UsersRepository);

// Keys repositories
container.bind<IKeysRepository>("IKeysRepository").to(KeysRepository);

// UserApi repositories
container.bind<IUserApiRepository>("IUserApiRepository").to(UserApiRepository);

// Resources repositories
container
  .bind<IResourcesRepository>("IResourcesRepository")
  .to(ResourcesRepository);
container
  .bind<IListAPIKeyUsageService>("IListAPIKeyUsageService")
  .to(ListAPIKeyUsageService);

// MessageQueue services
container.bind<NotifyWSService>("NotifyWSService").to(NotifyWSService);
container.bind<IQueueService>("IQueueService").to(RabbitMQService);

export default container;
