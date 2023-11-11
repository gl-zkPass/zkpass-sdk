import jwt from "jsonwebtoken";
import { NextApiRequest } from "next/types";

async function decodeJwt(token: string): Promise<any> {
    try {
        const secretKey = process.env.SECRET_KEY || "secret";
        const decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch (error) {
        console.log(error);
        return null;
    }
}

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
                console.log(error.message);
                return reject(error.message);
            }

            console.log(error);
            return reject("Error something happened");
        }
    });
};

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
