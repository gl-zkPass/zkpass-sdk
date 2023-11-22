import { Credential, DIDAccount } from "@/backend/implementation";
import { v4 } from "uuid";

jest.mock("../src/implementation/Auth", () => {
  return {
    Auth: jest.fn().mockImplementation(() => {
      return {
        authenticateSignature: jest.fn().mockImplementation(() => {
          return Promise.resolve(true);
        }),
      };
    }),
  };
});

export const didAccount = new DIDAccount(
  "b76896ed676eb2e8a0ed5817ec54e889b2a2b07500f6e54e5a6b22fa48dcf320"
);

describe("Credential Class", () => {
  it("Should properly sign the credential", async () => {
    const id = "http://example.org/" + v4();
    const receiverDID =
      "did:polygonid:polygon:mumbai:2qFoqCWuCzmSJuyuBqdWt1cRZhPRunUS6ZPZycCPY8";
    const credentialType = "KTP";
    const context = {
      NIK: "ex:NIK",
      Nama: "ex:Nama",
      BerlakuHingga: "ex:BerlakuHingga",
      Pekerjaan: "ex:Pekerjaan",
      StatusPerkawinan: "ex:StatusPerkawinan",
      GolonganDarah: "ex:GolonganDarah",
      Agama: "ex:Agama",
      TanggalLahir: "ex:TanggalLahir",
      TempatLahir: "ex:TempatLahir",
      Alamat: "ex:Alamat",
      Kecamatan: "ex:Kecamatan",
      KelurahanDesa: "ex:KelurahanDesa",
      Kewarganegaraan: "ex:Kewarganegaraan",
      KotaKabupaten: "ex:KotaKabupaten",
      Provinsi: "ex:Provinsi",
      RTRW: "ex:RTRW",
    };
    const credentialSubject = {
      NIK: 1808023348760001,
      Nama: "JHON DOE",
      BerlakuHingga: "SEUMUR HIDUP",
      Pekerjaan: "PEGAWAI SWASTA",
      StatusPerkawinan: "BELUM KAWIN",
      GolonganDarah: "O",
      Agama: "ISLAM",
      TanggalLahir: 19900208,
      TempatLahir: "GROGOL",
      Alamat: "JL. PETOJO VIJ.3 NO. 60",
      Kecamatan: "GAMBIR",
      KelurahanDesa: "CIDENG",
      Kewarganegaraan: "WNI",
      KotaKabupaten: "JAKARTA PUSAT",
      Provinsi: "DKI JAKARTA",
      RTRW: "001/001",
    };

    const credentialObject = new Credential();

    const signedCredential = await credentialObject.signCredential(
      {
        credentialSubject,
        issuer: didAccount,
        metadata: {
          credentialType,
          id,
          receiverDID,
          context,
        },
      },
      "message",
      "signature"
    );

    expect(signedCredential).toBeTruthy();
  });
});
