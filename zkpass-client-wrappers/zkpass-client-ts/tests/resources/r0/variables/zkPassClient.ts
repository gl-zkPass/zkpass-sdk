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
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Im5hbWUiOiJSYW1hbmEiLCJfbmFtZV96a3Bhc3NfcHVibGljXyI6dHJ1ZSwiZW1haWwiOiJyYW1hbmFAZXhhbXBsZS5jb20iLCJjaXR5IjoiSmFrYXJ0YSIsImNvdW50cnkiOiJJbmRvbmVzaWEiLCJza2lsbHMiOlsiUnVzdCIsIkphdmFTY3JpcHQiLCJIVE1ML0NTUyJdfX0.PfVgy_Byx9TzXWazJ8gMYDdouMs5jRe_FZDi3D71t03ay7UreZouTKWe43zlBMzCQnZox2oiyYVCvp7w8OFynA";

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
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Inprdm0iOiJyMCIsImR2cl90aXRsZSI6Ik15IERWUiIsImR2cl9pZCI6IjEyMzQ1Njc4IiwicXVlcnlfZW5naW5lX3ZlciI6IjAuMy4wLXJjLjEiLCJxdWVyeV9tZXRob2RfdmVyIjoiNzhhY2JhNmNiOTU0N2NlZmQ3MTk5NzI0YWNmZmNiYzhkMWU4NDE2ZTExZDljNWEwNzVjM2UxZTdjZjAyNGFjNyIsInF1ZXJ5IjoiW3tcImFzc2lnblwiOntcInF1ZXJ5X3Jlc3VsdFwiOntcImFuZFwiOlt7XCI9PVwiOlt7XCJkdmFyXCI6XCJjb3VudHJ5XCJ9LFwiSW5kb25lc2lhXCJdfSx7XCI9PVwiOlt7XCJkdmFyXCI6XCJjaXR5XCJ9LFwiSmFrYXJ0YVwiXX0se1wib3JcIjpbe1wifj09XCI6W3tcImR2YXJcIjpcInNraWxsc1swXVwifSxcIlJ1c3RcIl19LHtcIn49PVwiOlt7XCJkdmFyXCI6XCJza2lsbHNbMV1cIn0sXCJSdXN0XCJdfSx7XCJ-PT1cIjpbe1wiZHZhclwiOlwic2tpbGxzWzJdXCJ9LFwiUnVzdFwiXX1dfV19fX0se1wib3V0cHV0XCI6e1widGl0bGVcIjpcIkpvYiBRdWFsaWZpY2F0aW9uXCJ9fSx7XCJvdXRwdXRcIjp7XCJuYW1lXCI6e1wiZHZhclwiOlwibmFtZVwifX19LHtcIm91dHB1dFwiOntcImlzX3F1YWxpZmllZFwiOntcImx2YXJcIjpcInF1ZXJ5X3Jlc3VsdFwifX19LHtcIm91dHB1dFwiOntcInJlc3VsdFwiOntcImx2YXJcIjpcInF1ZXJ5X3Jlc3VsdFwifX19XSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL2hvc3RuYW1lL2FwaS91c2VyX2RhdGEvIiwidXNlcl9kYXRhX3ZlcmlmeWluZ19rZXkiOnsiUHVibGljS2V5Ijp7IngiOiJNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUU3ZjBRb1ZVc2NjQjl5TXdIQVI3b1ZrL0wrWmtYIiwieSI6IjhacUMxWjBYVGFqM0JNY01ucWgrVnpkSFpYM3lHS2EzK3VoTkFoS1dXeWZCL3IrM0U4clBTSHRYWFE9PSJ9fSwiZHZyX3ZlcmlmeWluZ19rZXkiOnsiUHVibGljS2V5Ijp7IngiOiJNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVwNldKbHdBdGxkL1U0aERtbXV1TWRaQ1Z0TWVVIiwieSI6IklUM3hrRGRVd0xPdnNWVkEraWlTd2ZhWDRIcUtsUlBER0crRjZXR2pueHlzOVQ1R3ROZTNudmV3T0E9PSJ9fX19.3zChNsnmltkmnoo7KERefxiV5MAOnRPzzQ0fnps18Z8XRUmyaSdk-eUtZyFa2LvwSNam1LwXGpI6HeSaUBmBjQ";

/**
 * Detail of the JWT token for DVR with public key.
 * {
 *   "zkvm": "r0",
 *   "dvr_title": "My DVR",
 *   "dvr_id": "12345678",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "4aedf64a7c4e37135274b76274d14a192e3afbe4eba12f3c9042b5e79f2d54",
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
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7Inprdm0iOiJyMCIsImR2cl90aXRsZSI6Ik15IERWUiIsImR2cl9pZCI6IjEyMzQ1Njc4IiwicXVlcnlfZW5naW5lX3ZlciI6IjAuMy4wLXJjLjEiLCJxdWVyeV9tZXRob2RfdmVyIjoiNGFlZGY2NGE3YzRlMzcxMzUyNzRiNzYyNzRkMTRhMTkyZTNhZmJlNGViYTEyZjNjOTA0MmI1ZTc5ZjJkNTQiLCJxdWVyeSI6IntcImFuZFwiOlt7XCI9PVwiOltcImJjYURvY0lEXCIsXCJET0M4OTc5MjNDUFwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmZpcnN0TmFtZVwiLFwiRGV3aVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmxhc3ROYW1lXCIsXCJQdXRyaVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmRyaXZlckxpY2Vuc2VOdW1iZXJcIixcIkRMMTIzNDU2Nzg5XCJdfSx7XCI-PVwiOltcImZpbmFuY2lhbEluZm8uY3JlZGl0UmF0aW5ncy5wZWZpbmRvXCIsNjUwXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmFjY291bnRzLnNhdmluZ3MuYmFsYW5jZVwiLDMwMDAwMDAwXX1dfSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL3h5ei5jb20iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRTdmMFFvVlVzY2NCOXlNd0hBUjdvVmsvTCtaa1giLCJ5IjoiOFpxQzFaMFhUYWozQk1jTW5xaCtWemRIWlgzeUdLYTMrdWhOQWhLV1d5ZkIvciszRThyUFNIdFhYUT09In19LCJkdnJfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRXA2V0psd0F0bGQvVTRoRG1tdXVNZFpDVnRNZVUiLCJ5IjoiSVQzeGtEZFV3TE92c1ZWQStpaVN3ZmFYNEhxS2xSUERHRytGNldHam54eXM5VDVHdE5lM252ZXdPQT09In19fX0.k0lpB-jcZceYiPJ1C2UlCvdPju86jvREv5lgDT3QSIUTzODnx4VcrP7zK3g9FcAMKvVu7f4j1a1lXPIjnp1QaQ";

/**
 * Detail of the JWT token for DVR with unmatching data.
 * {
 *   "zkvm": "r0",
 *   "dvr_title": "My DVR",
 *   "dvr_id": "12345678",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "4aedf64a7c4e37135274b76274d14a192e3afbe4eba12f3c9042b5e79f2d54",
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
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7Inprdm0iOiJyMCIsImR2cl90aXRsZSI6Ik15IERWUiIsImR2cl9pZCI6IjEyMzQ1Njc4IiwicXVlcnlfZW5naW5lX3ZlciI6IjAuMy4wLXJjLjEiLCJxdWVyeV9tZXRob2RfdmVyIjoiNGFlZGY2NGE3YzRlMzcxMzUyNzRiNzYyNzRkMTRhMTkyZTNhZmJlNGViYTEyZjNjOTA0MmI1ZTc5ZjJkNTQiLCJxdWVyeSI6IntcImFuZFwiOlt7XCI9PVwiOltcImJjYURvY0lEXCIsXCJET0M4OTc5MjNDUFwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmZpcnN0TmFtZVwiLFwiRGV3YVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmxhc3ROYW1lXCIsXCJQdXRyYVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmRyaXZlckxpY2Vuc2VOdW1iZXJcIixcIkRMMTIzNDU2Nzg5XCJdfSx7XCI-PVwiOltcImZpbmFuY2lhbEluZm8uY3JlZGl0UmF0aW5ncy5wZWZpbmRvXCIsNjUwXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmFjY291bnRzLnNhdmluZ3MuYmFsYW5jZVwiLDMwMDAwMDAwXX1dfSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL3h5ei5jb20iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19fX0.YiyeqNhIqUdgvaOWzXadBseIkgs-ZbOArB9ygCbcLjTn4YEkV331R079SQ3VKQAU5IlEdsV_sbtO1NJv3rLTFA";

/**
 * Detail of the JWT token for DVR with no dvr_title.
 * {
 *   "zkvm": "r0",
 *   "dvr_id": "12345678",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "4aedf64a7c4e37135274b76274d14a192e3afbe4eba12f3c9042b5e79f2d54",
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
  "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy92ZXJpZmllci1rZXkuanNvbiIsImtpZCI6ImstMSIsImFsZyI6IkVTMjU2In0.eyJkYXRhIjp7Inprdm0iOiJyMCIsImR2cl9pZCI6IjEyMzQ1Njc4IiwicXVlcnlfZW5naW5lX3ZlciI6IjAuMy4wLXJjLjEiLCJxdWVyeV9tZXRob2RfdmVyIjoiNGFlZGY2NGE3YzRlMzcxMzUyNzRiNzYyNzRkMTRhMTkyZTNhZmJlNGViYTEyZjNjOTA0MmI1ZTc5ZjJkNTQiLCJxdWVyeSI6IntcImFuZFwiOlt7XCI9PVwiOltcImJjYURvY0lEXCIsXCJET0M4OTc5MjNDUFwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmZpcnN0TmFtZVwiLFwiRGV3aVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmxhc3ROYW1lXCIsXCJQdXRyaVwiXX0se1wifj09XCI6W1wicGVyc29uYWxJbmZvLmRyaXZlckxpY2Vuc2VOdW1iZXJcIixcIkRMMTIzNDU2Nzg5XCJdfSx7XCI-PVwiOltcImZpbmFuY2lhbEluZm8uY3JlZGl0UmF0aW5ncy5wZWZpbmRvXCIsNjUwXX0se1wiPj1cIjpbXCJmaW5hbmNpYWxJbmZvLmFjY291bnRzLnNhdmluZ3MuYmFsYW5jZVwiLDMwMDAwMDAwXX1dfSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL3h5ei5jb20iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19fX0.jwN8ZFW6owwN8EjwPOu5fIu4PPJENs_9lZFOr80sHphYGR6wL7T-M_6Tzo9uFqaMbcOjoaW8_zLBtS3oKO66oA";

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
