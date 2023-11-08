import { NextApiRequest, NextApiResponse } from "next";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    try {
        await getCredentials(req, res);
    } catch (error) {
        res
            .status(StatusCodes.BAD_REQUEST)
            .send({ message: ReasonPhrases.BAD_REQUEST });
    }
}

async function getCredentials(req: NextApiRequest, res: NextApiResponse) {
    const response = {
        "credential": {
            "id": 6,
            "user_did": "did:ethr:0xcb5c68698a367c396dB6fE3Dd70A2e31e7134118",
            "credential_id": "63918bf3-fb19-4079-b93a-e92b43927212",
            "credential_type": "KtpCred",
            "user_data": "{\"credentialSubject\":{\"NIK\":1808023348760001,\"Nama\":\"JHON DOE\",\"BerlakuHingga\":\"SEUMUR HIDUP\",\"Pekerjaan\":\"PEGAWAI SWASTA\",\"StatusPerkawinan\":\"BELUM KAWIN\",\"GolonganDarah\":\"O\",\"Agama\":\"ISLAM\",\"TanggalLahir\":19900208,\"TempatLahir\":\"GROGOL\",\"Alamat\":\"Jl. PETOJO VIJ.3 NO. 60\",\"Kecamatan\":\"GAMBIR\",\"KelurahanDesa\":\"CIDENG\",\"Kewarganegaraan\":\"WNI\",\"KotaKabupaten\":\"JAKARTA PUSAT\",\"Provinsi\":\"DKI JAKARTA\",\"RTRW\":\"001/001\"}}",
            "signed_vc": "",
            "jws_credential": "",
            "is_revoked": false
        }
        ,
        "total": 1
    }

    res.status(StatusCodes.OK).json(response);
}

