/*
 * postinstall.js
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: January 2nd 2024
 * -----
 * Last Modified: May 10th 2024
 * Modified By: Zulchaidir (zulchaidir@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

const fs = require("fs");
const crypto = require("crypto");
const https = require("https");
const http = require("http");

const ZKPASS_ENV = process.env.ZKPASS_ENV || "prod";
const DIRECTORY = "./lib";
const STAGING_BASE_URL =
  "https://github.com/gl-zkPass/zkpass-sdk/releases/download/staging-lib";
const PLAYGROUND_BASE_URL =
  "https://github.com/gl-zkPass/zkpass-sdk/releases/download/playground-lib";

const BASE_URL =
  ZKPASS_ENV === "stag" || ZKPASS_ENV === "staging"
    ? STAGING_BASE_URL
    : PLAYGROUND_BASE_URL;

const R0_URL = `${BASE_URL}/libr0_zkpass_query.so`;
const SP1_URL = `${BASE_URL}/libsp1_zkpass_query.so`;

const SO = [
  {
    name: "R0",
    url: R0_URL,
  },
  {
    name: "SP1",
    url: SP1_URL,
  },
];

makeDirectory(DIRECTORY);
start(SO);

function makeDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.log(`Creating directory ${directory}`);
    fs.mkdirSync(directory);
  }
}

function start(SO) {
  const totalLengths = SO.map(() => 0);
  const currentLengths = SO.map(() => 0);
  const progresses = SO.map(() => 0);

  SO.forEach((elem, index) => {
    console.log(
      `Downloading ${ZKPASS_ENV} ${elem.name} image from ${elem.url}`
    );
    request(elem.url, async (res) => {
      totalLengths[index] = res.headers["content-length"];

      const fileName = res.headers["content-disposition"].split("filename=")[1];
      const path = `${DIRECTORY}/${fileName}`;

      // Checksum check
      const registryChecksum = await getChecksum(elem.url);
      const fileChecksum = await getChecksum(path);

      if (registryChecksum === fileChecksum) {
        currentLengths[index] = totalLengths[index];
        progresses[index] = 100.0;
        console.log(`[!] ${fileName} checksum match, skipping download`);
        return;
      }

      // Downloading file
      const fileStream = fs.createWriteStream(path, { flags: "w" });

      res.on("data", (chunk) => {
        currentLengths[index] += chunk.length;
        SO.forEach((elem, index) => {
          progresses[index] =
            (100.0 * currentLengths[index]) / totalLengths[index];

          if (index === 0) process.stdout.write("\r");
          else process.stdout.write("\n");

          const progress = `${progresses[index].toFixed(2)}%`;
          process.stdout.write(
            `Downloading ${elem.name}: ${
              progress === "100.00%" ? "DONE" : progress
            } (${currentLengths[index]}/${totalLengths[index]} bytes)`
          );
        });
        SO.forEach((_, idx) => {
          if (idx === 0) return;
          if (SO.every((_, idx) => progresses[idx] == 100))
            return console.log();
          process.stdout.write("\x1b[F");
        });
      });

      res.on("end", async () => {
        const fileChecksum = await getChecksum(path);

        if (registryChecksum !== fileChecksum)
          throw new Error(
            `Checksum mismatch for ${fileName}. Registry: ${registryChecksum}, File: ${fileChecksum}.\nPlease report this issue to contactus@zkpass.id.`
          );
      });

      res.pipe(fileStream);
    });
  });
}

function request(url, callback) {
  getRequestFunction(url)(url, (res) => {
    switch (res.statusCode) {
      case 200:
        if (res.headers["content-type"] !== "application/octet-stream")
          throw new Error(
            `Failed to download binary file from ${url}. Invalid content-type.\n${res.headers["content-type"]}`
          );
        callback && callback(res);
        break;

      case 302:
        if (!res.headers.location)
          throw new Error(`Redirection failed. No location header found.`);
        request(res.headers.location, callback);
        break;
      default:
        throw new Error(
          `Failed to fetch ${url} with status ${res.status}.\n${res.statusText}`
        );
    }
  });
}

function getRequestFunction(url) {
  return url.startsWith("https") ? https.get : http.get;
}

async function getChecksum(path) {
  return await (path.startsWith("http")
    ? getRegistryChecksum(path)
    : getFileChecksum(path));
}

async function getFileChecksum(path) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path)) return resolve(undefined);

    const hash = crypto.createHash("md5");
    hash.setEncoding("hex");

    const file = fs.createReadStream(path);

    file.on("error", reject);

    file.on("end", () => {
      hash.end();
      return resolve(hash.read());
    });

    file.pipe(hash);
  });
}

async function getRegistryChecksum(url) {
  return new Promise((resolve, reject) => {
    const checksumUrl = url.slice(0, -2) + "md5";

    request(checksumUrl, (res) => {
      let data = "";
      res.on("error", reject);
      res.on("data", (chunk) => (data += Buffer.from(chunk).toString()));
      res.on("end", () => resolve(data));
    });
  });
}
