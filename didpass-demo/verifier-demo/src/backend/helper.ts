import { getUnixTime } from "date-fns";
import jwt from "jsonwebtoken";
import { NextApiRequest } from "next/types";

/**
 * Send requests to url 
 * 
 * @param url 
 * @param config 
 *
 *  @returns {Promise<{ result, statusCode }>} 
 */
export const doRequest = async (
  url: string,
  config: RequestInit
): Promise<{
  result: any;
  statusCode: number | undefined;
}> => {
  return new Promise(async (resolve, reject) => {
    const response: Response = await fetch(url, config);
    const result = await response.json().then((data) => data);
    resolve({
      result: result,
      statusCode: response.status,
    });
  });
};

/**
 * Decode JWT token
 * 
 * @param token 
 * 
 * @returns {Promise<any>} 
 */
async function decodeJwt(token: string): Promise<any> {
  try {
    const secretKey = process.env.SECRET_KEY || "secret";
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Retrieve DID from request headers
 * 
 * @param req 
 * 
 * @returns {Promise<{did: string}>} 
 */
export const getDidFromRequestHeaders = async (
  req: NextApiRequest
): Promise<{
  did: string;
}> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await authToken(req);

      if (result.did !== undefined) {
        return resolve({
          did: result.did,
        });
      }

      return reject("did not found on token");
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
        return reject(error.message);
      }

      console.error(error);
      return reject("Error something happened");
    }
  });
};

/**
 * Decode JWT token
 * 
 * @param req 
 * 
 * @returns {Promise<any>}
 */
export const authToken = async (req: NextApiRequest): Promise<any> => {
  const token = req.headers.authorization?.split(" ")[1] as string;
  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = await decodeJwt(token);

  if (!decoded) {
    throw new Error("Invalid token");
  }

  return decoded;
};

/**
 * Get current time in UNIX
 * 
 * @returns {any}
 */
export function nowInUnix() {
  return getUnixTime(Date.now());
}