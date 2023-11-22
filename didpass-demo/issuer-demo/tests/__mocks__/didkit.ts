const didkit = {
  keyToDID: jest.fn().mockImplementation((didMethod, rawJwk) => {
    return "did:pkh:eip155:1:0xfF367dD64A5d111A13FD9248CCba62b2a155980b";
  }),
  keyToVerificationMethod: jest.fn().mockImplementation((didMethod, rawJwk) => {
    return Promise.resolve("pkh:eip155:1");
  }),
  issueCredential: jest
    .fn()
    .mockImplementation((credential, options, keypair) => {
      const vc = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1",
          {
            TempatLahir: "ex:TempatLahir",
            BerlakuHingga: "ex:BerlakuHingga",
            Kewarganegaraan: "ex:Kewarganegaraan",
            Alamat: "ex:Alamat",
            RTRW: "ex:RTRW",
            StatusPerkawinan: "ex:StatusPerkawinan",
            Agama: "ex:Agama",
            Kecamatan: "ex:Kecamatan",
            Provinsi: "ex:Provinsi",
            GolonganDarah: "ex:GolonganDarah",
            KotaKabupaten: "ex:KotaKabupaten",
            KelurahanDesa: "ex:KelurahanDesa",
            NIK: "ex:NIK",
            Pekerjaan: "ex:Pekerjaan",
            Nama: "ex:Nama",
            TanggalLahir: "ex:TanggalLahir",
          },
        ],
        id: "https://example.org/32ab1b7d-279c-4fc3-aa1f-fba6e488d66f",
        type: ["VerifiableCredential", "KTP"],
        credentialSubject: {
          TanggalLahir: 19900208,
          Kewarganegaraan: "WNI",
          Pekerjaan: "PEGAWAI SWASTA",
          NIK: 1808023348760001,
          GolonganDarah: "O",
          BerlakuHingga: "SEUMUR HIDUP",
          KotaKabupaten: "JAKARTA PUSAT",
          Nama: "JHON DOE",
          StatusPerkawinan: "BELUM KAWIN",
          Provinsi: "DKI JAKARTA",
          Alamat: "JL. PETOJO VIJ.3 NO. 60",
          RTRW: "001/001",
          KelurahanDesa: "CIDENG",
          Agama: "ISLAM",
          Kecamatan: "GAMBIR",
          TempatLahir: "GROGOL",
        },
        issuer: "did:pkh:eip155:1:issuer-did",
        issuanceDate: "2023-08-09T06:47:23.088Z",
        proof: {
          "@context": [
            "https://identity.foundation/EcdsaSecp256k1RecoverySignature2020/lds-ecdsa-secp256k1-recovery2020-0.0.jsonld",
            "https://demo.spruceid.com/EcdsaSecp256k1RecoverySignature2020/esrs2020-extra-0.0.jsonld",
          ],
          type: "EcdsaSecp256k1RecoverySignature2020",
          proofPurpose: "assertionMethod",
          verificationMethod:
            "did:pkh:eip155:1:verf-method#blockchainAccountId",
          created: "2023-08-09T06:47:23.088Z",
          jws: "jws-proof",
        },
        holder: "did:polygonid:polygon:mumbai:issuer-did",
      };
      return Promise.resolve(JSON.stringify(vc));
    }),
};

export default didkit;
