/*
 * seed.ts
 * A script to seed the database with data.
 *
 * Authors:
 *   Naufal (naufal.f.muhammad@gdplabs.id)
 * Created at: December 11th 2023
 * -----
 * Last Modified: December 11th 2023
 * Modified By: Naufal (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const load = async () => {
  try {
    console.log("---SEEDING STARTED---");

    //delete all data
    console.log("---Deleting all data---");
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    console.log("---Deleting all data completed---");

    //reset auto increment
    console.log("---Resetting auto increment---");
    await prisma.$queryRaw`ALTER TABLE Role AUTO_INCREMENT = 1`;
    await prisma.$queryRaw`ALTER TABLE User AUTO_INCREMENT = 1`;
    console.log("---Resetting auto increment completed---");

    // create roles
    console.log("---Seeding role---");
    await prisma.role.createMany({
      data: [{ name: "root" }, { name: "admin" }],
    });
    console.log("---Seeding role completed---");

    //create users
    console.log("---Seeding users---");
    await prisma.user.createMany({
      data: [
        {
          email: "naufal.f.muhammad@gdplabs.id",
          name: "root pal",
          status: 1,
          roleId: 1,
          createdBy: "Prisma seed",
          lastModifiedBy: "Prisma seed",
        },
        {
          email: "zulchaidir@gdplabs.id",
          name: "dev zul",
          status: 1,
          roleId: 2,
          createdBy: "Prisma seed",
          lastModifiedBy: "Prisma seed",
        },
        {
          email: "william.h.hendrawan@gdplabs.id",
          name: "dev wewe",
          status: 1,
          roleId: 2,
        },
      ],
    });
    console.log("---Seeding users completed---");

    console.log("---SEEDING COMPLETED---");
  } catch (e) {
    console.log(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

load();
