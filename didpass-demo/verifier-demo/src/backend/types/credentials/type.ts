export type VerifyField = KtpField;

export enum KtpField {
  NIK = "NIK",
  Name = "Nama",
  ExpiryDate = "BerlakuHingga",
  Job = "Pekerjaan",
  MaritalStatus = "StatusPerkawinan",
  BloodType = "GolonganDarah",
  Religion = "Agama",
  BirthDate = "TanggalLahir",
  BirthPlace = "TempatLahir",
  Address = "Alamat",
  Gender = "JenisKelamin",
  District = "Kecamatan",
  Village = "KelurahanDesa",
  IndonesianNationality = "Kewarganegaraan",
  City = "KotaKabupaten",
  Province = "Provinsi",
  RT_RW = "RTRW",
}

export enum VerifyOperator {
  equal = "$eq",
  lessThan = "$lt",
  greaterThan = "$gt",
  in = "$in",
  notIn = "$nin",
  notEqual = "$ne",
}

export interface VerifyType {
  type: string;
  field: string;
  operator: VerifyOperator;
  value: string | number | string[] | number[];
}
