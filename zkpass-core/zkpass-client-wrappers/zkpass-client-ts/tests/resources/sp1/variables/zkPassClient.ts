/*
 * zkPassClient.ts
 * zkPass Client mock values.
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: April 23rd 2024
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   zulamdat (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

/**
 * Detail of the JWT token for user data.
 * {
 *  "name": "Ramana",
 *  "_name_zkpass_public_": true,
 *  "email": "ramana@example.com",
 *  "city": "Jakarta",
 *  "country": "Indonesia",
 *  "skills": ["Rust", "JavaScript", "HTML/CSS"]
 * }
 */
export const userDataJwt =
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Im5hbWUiOiJSYW1hbmEiLCJfbmFtZV96a3Bhc3NfcHVibGljXyI6dHJ1ZSwiZW1haWwiOiJyYW1hbmFAZXhhbXBsZS5jb20iLCJjaXR5IjoiSmFrYXJ0YSIsImNvdW50cnkiOiJJbmRvbmVzaWEiLCJza2lsbHMiOlsiUnVzdCIsIkphdmFTY3JpcHQiLCJIVE1ML0NTUyJdfX0.oEYYj0c8qotic54zgDdN7ghcPO0hD2nHTxb6RWX0KFL41h0qQ9I6igyFdDoHcP0aacYBy4zvZbtOgOITMXORIw";

/**
 * Detail of the JWT token for DVR.
 * [
 *  {
 *    "assign": {
 *      "query_result": {
 *        "and": [
 *          {
 *            "==": [
 *              {
 *                "dvar": "country"
 *              },
 *              "Indonesia"
 *            ]
 *          },
 *          {
 *            "==": [
 *              {
 *                "dvar": "city"
 *              },
 *              "Jakarta"
 *            ]
 *          },
 *          {
 *            "or": [
 *              {
 *                "~==": [
 *                  {
 *                    "dvar": "skills[0]"
 *                  },
 *                  "Rust"
 *                ]
 *              },
 *              {
 *                "~==": [
 *                  {
 *                    "dvar": "skills[1]"
 *                  },
 *                  "Rust"
 *                ]
 *              },
 *              {
 *                "~==": [
 *                  {
 *                    "dvar": "skills[2]"
 *                  },
 *                  "Rust"
 *                ]
 *              }
 *            ]
 *          }
 *        ]
 *      }
 *    }
 *  },
 *  {
 *    "output": {
 *      "title": "Job Qualification"
 *    }
 *  },
 *  {
 *    "output": {
 *      "name": {
 *        "dvar": "name"
 *      }
 *    }
 *  },
 *  {
 *    "output": {
 *      "is_qualified": {
 *        "lvar": "query_result"
 *      }
 *    }
 *  },
 *  {
 *    "output": {
 *      "result": {
 *        "lvar": "query_result"
 *      }
 *    }
 *  }
 * ]
 */
export const dvrJwt =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiIxMjM0NTY3OCIsInF1ZXJ5X2VuZ2luZV92ZXIiOiIwLjMuMC1yYy4xIiwicXVlcnlfbWV0aG9kX3ZlciI6ImE2Yzk5ZmE4NjY0YzA3ZTk3NWY2YzZhOWYzMTg3ODMwMGU5NzQ2OGM3OGZhMTZiZDY0ODViNjkwYmNjMDdmOTUiLCJxdWVyeSI6Ilt7XCJhc3NpZ25cIjp7XCJxdWVyeV9yZXN1bHRcIjp7XCJhbmRcIjpbe1wiPT1cIjpbe1wiZHZhclwiOlwiY291bnRyeVwifSxcIkluZG9uZXNpYVwiXX0se1wiPT1cIjpbe1wiZHZhclwiOlwiY2l0eVwifSxcIkpha2FydGFcIl19LHtcIm9yXCI6W3tcIn49PVwiOlt7XCJkdmFyXCI6XCJza2lsbHNbMF1cIn0sXCJSdXN0XCJdfSx7XCJ-PT1cIjpbe1wiZHZhclwiOlwic2tpbGxzWzFdXCJ9LFwiUnVzdFwiXX0se1wifj09XCI6W3tcImR2YXJcIjpcInNraWxsc1syXVwifSxcIlJ1c3RcIl19XX1dfX19LHtcIm91dHB1dFwiOntcInRpdGxlXCI6XCJKb2IgUXVhbGlmaWNhdGlvblwifX0se1wib3V0cHV0XCI6e1wibmFtZVwiOntcImR2YXJcIjpcIm5hbWVcIn19fSx7XCJvdXRwdXRcIjp7XCJpc19xdWFsaWZpZWRcIjp7XCJsdmFyXCI6XCJxdWVyeV9yZXN1bHRcIn19fSx7XCJvdXRwdXRcIjp7XCJyZXN1bHRcIjp7XCJsdmFyXCI6XCJxdWVyeV9yZXN1bHRcIn19fV0iLCJ1c2VyX2RhdGFfdXJsIjoiaHR0cHM6Ly9ob3N0bmFtZS9hcGkvdXNlcl9kYXRhLyIsInVzZXJfZGF0YV92ZXJpZnlpbmdfa2V5Ijp7IlB1YmxpY0tleSI6eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFN2YwUW9WVXNjY0I5eU13SEFSN29Way9MK1prWCIsInkiOiI4WnFDMVowWFRhajNCTWNNbnFoK1Z6ZEhaWDN5R0thMyt1aE5BaEtXV3lmQi9yKzNFOHJQU0h0WFhRPT0ifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IlB1YmxpY0tleSI6eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFcDZXSmx3QXRsZC9VNGhEbW11dU1kWkNWdE1lVSIsInkiOiJJVDN4a0RkVXdMT3ZzVlZBK2lpU3dmYVg0SHFLbFJQREdHK0Y2V0dqbnh5czlUNUd0TmUzbnZld09BPT0ifX19fQ.Jh11Y6xG1dT6eA1elf5Q66I1blkx6qTg_HutDxJY2hdFDkusibdUq2WqBYVtJfimiv6tbuxlq94AAQH-DEyeaQ";

/**
 * Detail of the JWT token for DVR with public key.
 * {
 *   "zkvm": "sp1",
 *   "dvr_title": "My DVR",
 *   "dvr_id": "12345678",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "60e4a963ae85def0c4fc0beca08f56385d270371d4ebd1b6a8fe66b6132e9b27",
 *   "query": "{\"and\":[{\"==\":[\"bcaDocID\",\"DOC897923CP\"]},{\"~==\":[\"personalInfo.firstName\",\"Dewi\"]},{\"~==\":[\"personalInfo.lastName\",\"Putri\"]},{\"~==\":[\"personalInfo.driverLicenseNumber\",\"DL123456789\"]},{\">=\":[\"financialInfo.creditRatings.pefindo\",650]},{\">=\":[\"financialInfo.accounts.savings.balance\",30000000]}]}",
 *   "user_data_url": "https://xyz.com",
 *   "user_data_verifying_key": {
 *     "PublicKey": {
 *       "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX",
 *       "y": "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="
 *     }
 *   },
 *   "dvr_verifying_key": {
 *     "PublicKey": {
 *       "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
 *       "y": "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="
 *     }
 *   }
 * }
 */
export const dvrJwtWithPublicKey =
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiIxMjM0NTY3OCIsInF1ZXJ5X2VuZ2luZV92ZXIiOiIwLjMuMC1yYy4xIiwicXVlcnlfbWV0aG9kX3ZlciI6IjYwZTRhOTYzYWU4NWRlZjBjNGZjMGJlY2EwOGY1NjM4NWQyNzAzNzFkNGViZDFiNmE4ZmU2NmI2MTMyZTliMjciLCJxdWVyeSI6IntcImFuZFwiOlt7XCI9PVwiOltcImJjYURvY0lEXCIsXCJET0M4OTc5MjNDUFwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmZpcnN0TmFtZVwiLFwiRGV3aVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmxhc3ROYW1lXCIsXCJQdXRyaVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmRyaXZlckxpY2Vuc2VOdW1iZXJcIixcIkRMMTIzNDU2Nzg5XCJdfSx7XCI-PVwiOltcImZpbmFuY2lhbEluZm8uY3JlZGl0UmF0aW5ncy5wZWZpbmRvXCIsNjUwXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmFjY291bnRzLnNhdmluZ3MuYmFsYW5jZVwiLDMwMDAwMDAwXX1dfSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL3h5ei5jb20iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRTdmMFFvVlVzY2NCOXlNd0hBUjdvVmsvTCtaa1giLCJ5IjoiOFpxQzFaMFhUYWozQk1jTW5xaCtWemRIWlgzeUdLYTMrdWhOQWhLV1d5ZkIvciszRThyUFNIdFhYUT09In19LCJkdnJfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRXA2V0psd0F0bGQvVTRoRG1tdXVNZFpDVnRNZVUiLCJ5IjoiSVQzeGtEZFV3TE92c1ZWQStpaVN3ZmFYNEhxS2xSUERHRytGNldHam54eXM5VDVHdE5lM252ZXdPQT09In19fX0.BcFOsS77uc9S116vB3nUh0G2EW7gXg_7k2vBXAY8jfssYI8WwctsE45gDD-3zJbEcTOl1O5NKLHJDx998-JQ2A";

/**
 * Detail of the JWT token for DVR with unmatching data.
 * {
 *   "zkvm": "sp1",
 *   "dvr_title": "My DVR",
 *   "dvr_id": "12345678",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "60e4a963ae85def0c4fc0beca08f56385d270371d4ebd1b6a8fe66b6132e9b27",
 *   "query": "{\"and\":[{\"==\":[\"bcaDocID\",\"DOC897923CP\"]},{\"~==\":[\"personalInfo.firstName\",\"Dewa\"]},{\"~==\":[\"personalInfo.lastName\",\"Putra\"]},{\"~==\":[\"personalInfo.driverLicenseNumber\",\"DL123456789\"]},{\">=\":[\"financialInfo.creditRatings.pefindo\",650]},{\">=\":[\"financialInfo.accounts.savings.balance\",30000000]}]}",
 *   "user_data_url": "https://xyz.com",
 *   "user_data_verifying_key": {
 *     "KeysetEndpoint": {
 *       "jku": "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json",
 *       "kid": "k-1"
 *     }
 *   },
 *   "dvr_verifying_key": {
 *     "KeysetEndpoint": {
 *       "jku": "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json",
 *       "kid": "k-1"
 *     }
 *   }
 * }
 */
export const unmatchingDvrJwt =
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiIxMjM0NTY3OCIsInF1ZXJ5X2VuZ2luZV92ZXIiOiIwLjMuMC1yYy4xIiwicXVlcnlfbWV0aG9kX3ZlciI6IjYwZTRhOTYzYWU4NWRlZjBjNGZjMGJlY2EwOGY1NjM4NWQyNzAzNzFkNGViZDFiNmE4ZmU2NmI2MTMyZTliMjciLCJxdWVyeSI6IntcImFuZFwiOlt7XCI9PVwiOltcImJjYURvY0lEXCIsXCJET0M4OTc5MjNDUFwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmZpcnN0TmFtZVwiLFwiRGV3YVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmxhc3ROYW1lXCIsXCJQdXRyYVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmRyaXZlckxpY2Vuc2VOdW1iZXJcIixcIkRMMTIzNDU2Nzg5XCJdfSx7XCI-PVwiOltcImZpbmFuY2lhbEluZm8uY3JlZGl0UmF0aW5ncy5wZWZpbmRvXCIsNjUwXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmFjY291bnRzLnNhdmluZ3MuYmFsYW5jZVwiLDMwMDAwMDAwXX1dfSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL3h5ei5jb20iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19fX0.CMl0GcFEmUZqpy3LA-hnzEMYtEOlAQp2R917iTXrRh6xGWoLMHxX_eO7U2KzJSiT5nyYS900bWB4dMPOsm30mA";

/**
 * Detail of the JWT token for DVR with no dvr_title.
 * {
 *   "zkvm": "sp1",
 *   "dvr_id": "12345678",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "60e4a963ae85def0c4fc0beca08f56385d270371d4ebd1b6a8fe66b6132e9b27",
 *   "query": "{\"and\":[{\"==\":[\"bcaDocID\",\"DOC897923CP\"]},{\"~==\":[\"personalInfo.firstName\",\"Dewi\"]},{\"~==\":[\"personalInfo.lastName\",\"Putri\"]},{\"~==\":[\"personalInfo.driverLicenseNumber\",\"DL123456789\"]},{\">=\":[\"financialInfo.creditRatings.pefindo\",650]},{\">=\":[\"financialInfo.accounts.savings.balance\",30000000]}]}",
 *   "user_data_url": "https://xyz.com",
 *   "user_data_verifying_key": {
 *     "KeysetEndpoint": {
 *       "jku": "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json",
 *       "kid": "k-1"
 *     }
 *   },
 *   "dvr_verifying_key": {
 *     "KeysetEndpoint": {
 *       "jku": "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json",
 *       "kid": "k-1"
 *     }
 *   }
 * }
 */
export const badDvrJwt = // this DVR has no dvr_title
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfaWQiOiIxMjM0NTY3OCIsInF1ZXJ5X2VuZ2luZV92ZXIiOiIwLjMuMC1yYy4xIiwicXVlcnlfbWV0aG9kX3ZlciI6IjYwZTRhOTYzYWU4NWRlZjBjNGZjMGJlY2EwOGY1NjM4NWQyNzAzNzFkNGViZDFiNmE4ZmU2NmI2MTMyZTliMjciLCJxdWVyeSI6IntcImFuZFwiOlt7XCI9PVwiOltcImJjYURvY0lEXCIsXCJET0M4OTc5MjNDUFwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmZpcnN0TmFtZVwiLFwiRGV3aVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmxhc3ROYW1lXCIsXCJQdXRyaVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmRyaXZlckxpY2Vuc2VOdW1iZXJcIixcIkRMMTIzNDU2Nzg5XCJdfSx7XCI-PVwiOltcImZpbmFuY2lhbEluZm8uY3JlZGl0UmF0aW5ncy5wZWZpbmRvXCIsNjUwXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmFjY291bnRzLnNhdmluZ3MuYmFsYW5jZVwiLDMwMDAwMDAwXX1dfSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL3h5ei5jb20iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19fX0.UhhXS5GyuXugT76Q4IwNbk0nomYkWOoVXplh89BvpScsD_fFzmVlAPDM5rmgn26rH4NqMqKgR67I3HQp9ZFagg";

export const mockData = {
  hello: "World!",
};

export const mockDataJwe =
  "eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImVwayI6eyJ4IjoiNHpra0tzZmxVWi1Sc3dRbm9SeGwxX055U3NrREM3bjNTd05qaHVZWEhSbyIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ5Ijoibm91WS1zZ0ZVeFNYYkJBTW5DRUN5LXFEQ1Y3Z0NEUkhzUmc3YWM5V1V3NCJ9fQ..086qAtAYW223y-M1.nmXCtEhFHGx0TCztrssFOxbYufVr6azzewja.n2oBgOrycXPk28pT_8ARGw";

/**
 * Detail data of the JWT token.
 * {
 *   "hello": "World!"
 * }
 */
export const mockDataJwsToken =
  "eyJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7ImhlbGxvIjoiV29ybGQhIn19.p-r4BE_QnfzrE-lIjioFguWqGJl2ImPHN31pWY1u6p9xkDMOTi840ynKj1-nbngqKclAoING7ScJEj5MrRfwYw";

/**
 * Detail of bad user data JWT token (no firstName that needed by DVR).
 * {
 *  "name": "Ramana",
 *  "_name_zkpass_public_": true,
 *  "email": "ramana@example.com",
 *  "city": "Jakarta",
 *  "skills": ["Rust", "JavaScript", "HTML/CSS"]
 * }
 */
export const badUserDataJwt =
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Im5hbWUiOiJSYW1hbmEiLCJfbmFtZV96a3Bhc3NfcHVibGljXyI6dHJ1ZSwiZW1haWwiOiJyYW1hbmFAZXhhbXBsZS5jb20iLCJjaXR5IjoiSmFrYXJ0YSIsInNraWxscyI6WyJSdXN0IiwiSmF2YVNjcmlwdCIsIkhUTUwvQ1NTIl19fQ.bOLLWlHLBepTlZ3KUyAkvfIv9xLU2R9xIHkrSa7xK7Sbeo9TXxnHEGhEfuVHi0u2Lddgz1H00m5mn1T0Q6Ss8A";
