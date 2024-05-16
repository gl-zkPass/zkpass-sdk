/*
 * dvrVariables.ts
 * Mocked Data Verification Request for unit test.
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: April 22nd 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

/**
 * Detail of the JWT token for DVR with PublicKey.
 *
 * const mockDvr =  {
 *   "zkvm": "sp1",
 *   "dvr_title": "My DVR",
 *   "dvr_id": "68de2cff-d894-4a69-9ebe-160136d4be50",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "92609d0e4ae3211016668d693007026d2a005f1ced6c6ed67e440c85bb63efe5",
 *   "query": [
 *     {
 *       "assign": {
 *         "query_result": {
 *           "and": [
 *             { "==": [{ "dvar": "country" }, "Indonesia"] },
 *             { "==": [{ "dvar": "city" }, "Jakarta"] },
 *             {
 *               "or": [
 *                 { "~==": [{ "dvar": "skills[0]" }, "Rust"] },
 *                 { "~==": [{ "dvar": "skills[1]" }, "Rust"] },
 *                 { "~==": [{ "dvar": "skills[2]" }, "Rust"] },
 *               ],
 *             },
 *           ],
 *         },
 *       },
 *     },
 *     { "output": { "title": "Job Qualification" } },
 *     { "output": { "name": { "dvar": "name" } } },
 *     { "output": { "is_qualified": { "lvar": "query_result" } } },
 *     { "output": { "result": { "lvar": "query_result" } } },
 *   ],
 *   "user_data_url": "https://hostname/api/user_data/",
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
const mockDvrWithPublicKeyJwt =
  'eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn0.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiJkMDRiZTM5YS0wZGM3LTRhNjEtOTg5NS0wOTEyMWE5NjFmYjciLCJxdWVyeV9lbmdpbmVfdmVyIjoiMC4zLjAtcmMuMSIsInF1ZXJ5X21ldGhvZF92ZXIiOiI5MjYwOWQwZTRhZTMyMTEwMTY2NjhkNjkzMDA3MDI2ZDJhMDA1ZjFjZWQ2YzZlZDY3ZTQ0MGM4NWJiNjNlZmU1IiwicXVlcnkiOiJbe1wiYXNzaWduXCI6e1wicXVlcnlfcmVzdWx0XCI6e1wiYW5kXCI6W3tcIj09XCI6W3tcImR2YXJcIjpcImNvdW50cnlcIn0sXCJJbmRvbmVzaWFcIl19LHtcIj09XCI6W3tcImR2YXJcIjpcImNpdHlcIn0sXCJKYWthcnRhXCJdfSx7XCJvclwiOlt7XCJ-PT1cIjpbe1wiZHZhclwiOlwic2tpbGxzWzBdXCJ9LFwiUnVzdFwiXX0se1wifj09XCI6W3tcImR2YXJcIjpcInNraWxsc1sxXVwifSxcIlJ1c3RcIl19LHtcIn49PVwiOlt7XCJkdmFyXCI6XCJza2lsbHNbMl1cIn0sXCJSdXN0XCJdfV19XX19fSx7XCJvdXRwdXRcIjp7XCJ0aXRsZVwiOlwiSm9iIFF1YWxpZmljYXRpb25cIn19LHtcIm91dHB1dFwiOntcIm5hbWVcIjp7XCJkdmFyXCI6XCJuYW1lXCJ9fX0se1wib3V0cHV0XCI6e1wiaXNfcXVhbGlmaWVkXCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX0se1wib3V0cHV0XCI6e1wicmVzdWx0XCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX1dIiwidXNlcl9kYXRhX3VybCI6Imh0dHBzOi8vaG9zdG5hbWUvYXBpL3VzZXJfZGF0YS8iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRTdmMFFvVlVzY2NCOXlNd0hBUjdvVmsvTCtaa1giLCJ5IjoiOFpxQzFaMFhUYWozQk1jTW5xaCtWemRIWlgzeUdLYTMrdWhOQWhLV1d5ZkIvciszRThyUFNIdFhYUT09In19LCJkdnJfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRXA2V0psd0F0bGQvVTRoRG1tdXVNZFpDVnRNZVUiLCJ5IjoiSVQzeGtEZFV3TE92c1ZWQStpaVN3ZmFYNEhxS2xSUERHRytGNldHam54eXM5VDVHdE5lM252ZXdPQT09In19fX0.Lga2t4CADyUvep_mIExedD4cql9mUp0FF6eIxo5RG3Bv2Bh5iWlHXRu9eGWQb3t7sXQI0b9SWbLG13HMhrD1d';
const mockDvrWithPublicKeyJweServer =
  'eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImVwayI6eyJ4IjoibUU0dmZMSVJlcmdhSTFDNzVfWUNSVFVrSkpyWDR4MDJuWG5tVFNWekRtNCIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ5IjoiY2ZSblhkWTcyUE5yOFBvbnhLVWVXZW9oaHZQUmxoLUFkbnBBa1dId1hlVSJ9fQ..1x5uuA3aBA5QyI_6.bpfGs8t1whJdy34N1OWbuBV0eirB5QKwLLmQODqW22Jkpo-YeW6nPp7mMQtRi5UA8M-LZASb5evD_ayyoApY_okCjMNH5sjL8yWGhJ90UO0CR325keu3hylasMaKJJT4Hv-dcS4UCFa9eGRMyfbLVRecPwm_WeNdb6Y9m4oQja_aVf6MPPDcL8v77NK09LA20RJTBjl-CjxYAaFQJQr9jk8P3EneWIiR-xa9z5-yAL_a7f2Og_kaH_ymK8MfRGjqWj27sSWiV0Wz0lFBVAViZt_xC-jS0_un93QHX_wPzE7C9SJMftcz1QKwaoEDjiCM_TVaX4qLnWZMufSE4VHL4KJVFdAk4wLsBUft-SWsq312fy-0b1ok7Q-fjVs_vN9OFsZ1RxymBT2llhmdnvduTQN49hc-cRJ7jRlobS7EKWpSzr2C_ERnv-hJR3Z2RLEsg-0OU-1WdGW6S5MDk48C5ldGsdg-tUrVDwGoWoEYkwNngb75IQaRcaaPoq_HPxKpCVNMUCU4JG4-IkcKQNETtwMBy7pKq0u5gITu1a7KvLz9EDq1WpZ4hPd3-VfZ7FQnBmLNbC6k-F0FNuopgR_nmZEUqx6GpTanRZiyU4Iq7fpEUg8L4bWGUJSGzpaOsQpULkXQ_8Lr0GZVXRfJ4zXcI3-RUUMxzfFiUlgXYMphM9mcb-AdPBHSBAZLgt6n3mESmHXkN4YXrn1IWZ-L7Y_V1oiHwgwxROhT7qT43PnNYiYru14lauHeRGwY4AadmoF2JyOECYVzTuAnzpDc3TThsCU1JKOJ4W6kfx6oYpWDwX6TU6U_zKPEIYd1UZ-nqRL_OMgv8_jnb8BPuJ-smIs3TZKsd2-iMEVL-UtlOFmqhfiVKAP96hxaMNCE9eosnTeOa7pLm87phdvt0HfplU9Prw3f4c9MrzRnXvJBb-zDhMb6oqmm6njR4XlflG14SVrTYe9rwwCxeRkNouPQqEG-L2rZmFDw7ecC7eczZkVRAh56EM6z1XY7HCPBXtvWRz_QthEUPWzotczCUA0-o7EWzcQeUHPdFsRdLJaPRawZvRJ3dnm_wm4x-nW4inWuM-nmNsm5aYm6xPys1g4woJ0EC9AmsJbkIzw5CYQjj78L3FvBljbXVHjufylmjnk7lT-GuMQNHos6kWBqxux7E-mSjB5IiwgHKrXJ7rP-sT6fsmTTGf7RdlpiYGYucNzn4Kr93eaaQUzDalcQTtiKowVTlJykLqG94ogpuoA425meI-1ioNQOpFxXkptEiCe8dTgt8z2V86DUiik9lbg4vYUXiXyuyJCZQLaQrrKMmoUrNTT-8MQBf5h6s13MRIQMuUS6drAe-qL_mjuOw9n3Wl0k3gjbG7Njskyj5muKvmWQ4DzZRRpp7HFsHNSL0azRWqjgwuHkwXVG2gRGdiv1ft7_kKTpcfVFcRAuJgZ5wfE9Sz1yLqfGJ88_TaoZDC3isYXssGUGcmW4itPn-mFBYZ2ti0nfSX9ZjR6uLkhRTglRCJErNML26n2H04br3_oGudKjct5u5OG2OsiPYF0i2MuemQZvConPjYSs6zPE7lhKF5R7nno98NXmX8ZYqcTZj12xD91Y9tSOBrZA51vencgvdW6u2MVL9ZdGeqlI-CEOL5-4yKA8gARlz8sxjC59zO5uArnq3bcz6C9dLTASk0G03EvM1_58U8iZdlFrqsDah88V_v534FQyeBXE0cYO7XVlb8KFCnonTnXu97InMZiYEUAGj5ZVZt07onSGQA01UAiz5go71qkdkHatL3a7ffTvfvuQXWDttnm2MyjsA1K8WBQvDO3w7q_xwfKZ1XhaX6OA5ArpU5k7Fk30kk1AA6IyF3Ps0tQJAmh13ZSecOkIxRWCu18xU2lq6qd7VpS8FscsPk9pNUk6p9dbjl_xK3pN5_cBSxEqc7UyX6QWFSb9QpdPVA-OXaysCYC7RtYjfXm9O1gScO_8zkQnrcjuRdEAciE8Z-6cBwWy7TUfNBDmzMJHEfmg-rx0qcQgKp2JGx8U9_BLjFFqoRkNEq62YsfkfAamQJT4OTAWUNq4Fb3KXQiFpBunHsSsyp0Di707dyy9H5F6vx9rC9MPjv0gVnCMRAO-aHdnP3v3HCAEJL89jjVy-3SxPR2wqO0p0XfqevxvlC2DAy3Y2ONYEGGAT6PpZPdb_jYHUquoG46tMw0y14XTxKKmgFW49e0UTVEM0UKw_FyRVDnGf8fazZrLB6pT9AKIBoTgHytNS4bhQih8RNI9qA-ge83KhNS1TfnJ0k7Q33jI_QptNXMy3az6iAo5kvDwBPsqUb2HnMx4HAqamFMf1WfZpoN3FNY8TaEdrnmg2n6vsUv-iWM.ONx_Lvi1f1K3KiYncMCIfQ';
const mockDvrWithPublicKeyJweLocal =
  'eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImVwayI6eyJ4IjoibndycGJSSXNtTk1PS2NLQW5CX3Z0c1BpVXA2ZzVMcHZDWkEyVERNS29KOCIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ5Ijoic3dVdHcyS09qZzMyUlJrQVFoUnNER3RINzQxZHQyTFhRR0lNd2MtdTBLRSJ9fQ..u-GXkYjyCp3pR6js.sXIcoXJSZZ3dDSuO0VyWQbVEdXFmevDjN6m3KPy92zGRbKkctm-4fvhuqH8Oy_QI1KFMQrUFuUzj0RD-j1h_OyygW61PjUouF9GOGZ_99HscwaV9nlqkNUhMMSBFZWVjEd1ymz6M-RDD23o7G13hoXjkXId7kdkJ1vgg4W8Oph1kdu5obm6bY00cIV_dZDjsiSTjpJ0D6QifmNSoPEKoibklWfVZkdPyrozkvRfIB14ppUip238rdMbPJXLAydYDiNtv2Q2pCmByv0YK_qIP3GM0EfxpStp7hngJ30jQE9BaAIwKi_S-W_Fr8-QU9P1zPL3e5NSZk85UZKz-cpzve5x9eA_pCNUHc9vEJi6qWM3VTIc6MFck4yYJ_KC81V5lk55T38xWwEPmYIMSe95dRRKq9jhWq9sTL1KFsQW9jpolBvZYkmRKG4ZRZhlaV35vmuKSNs6ZDkzNPReAOfjee3qShgMqeCIsnfVLM0MewZhrsTgqwO4nxlffm4qFBm9HoGa2Yr8fywVIeUBXz_2bTrpVluGvbyiINEhwnLWUNDAL4RRvnTmsUGWAR5i0zdEZjdapmpnSw8VhchMX5hiXjhobwbu_voS7ZB2Lf_e_rg9FT9ZybUohdF8rWL6ugER2o5ZISwasdi1YFVeP907ej8JTQYctiapjSQPdsg9ad_2pWptLFAI15XD61bx5a__pW-UzydmobMTOq3871BQrnWRfyhfFeoZ8gvLG5sMvbM-rTWOTAjhECkDA87rZjY_FHDRgw5W-1AklgkCeOMdn3FOZgLxv0g7PsbHJ0ZDoo9vkOyFXA3h0R_LIw-s7szZUnsRHiE_Cr3VyHo3yzLJ4gjcRlFO5G-yQXmS0_25rNF9OnfF3bQDlLPD1eFrd9_Ykwond9ytcq0Rd3jr-JQxrYwg5d5B8IX2N5FWYCA0ORDe-CNQWGwQcadOlKcPtURW6k8YOBCVCEpb4m_yJgiL9WNwqrBsliA8SKDwziH4e7mj1ScJ9PHwkRv41j2tQ-E23JPdtdPQbLvTKphSREonobsCBn6Nxc1G-tqadCYePtQ5FI1-3IUCNwD3cU6uRnb2eVN5RgqhM68x0AUNB0nulmLvoddvcKozusfTt1P_NcoNpRGxy99jUH10C9A8P-UByoAdyQRGhnV89hCWGAbwqUBm9jFCotEmnkF2AV9Qk6AnRoSJsFTCFtbChawZlDQjZjfBCYGg1ldbS4l5qcNv0xQUZ-0qASvob08T_hh6ZAThuwS9vj1z1YS9i7keuSrDxKN7StDA23VcvOuL2MID3vsFi7t8haRsNH4-U7UprEMvR_sNupls0DsEulHod0YLUnwYDIAUDrFvLw3lTuIu5a4ygj9EXat0iD3EdIsrMODh0mQXkJsk-jrVq8hVeqRu8CY4odj8Vkghl3n8v8cfXuCt3Z9kgKQiV0PYHuR5gihD-mwPKRwxlZmE1ETP5NesiTekDADDtJMBHPnRNJ_I-qJx-XZsvTQsEyJGpCVP8bgwdy-fvAQNNncP4CIQN3_Ewl0KpgZmAvS6BjczXu2x-EvQ5yPnO15zLl8ZPSyxaTP4LTUVZZ7yXazUoUqdFN2Aq23jPqhIic4AGLaMWr9yQW762am95c-lVQRSjW8IGu6LvWXOtb7Q1YBK3QX5vynTF23TRFpdYc8A1o85j2GCVmrjyUpiXxVZd2g2oVtBJI0WM9GmIInVYIDOvNgHWwlqNLhndXSWszkLosSE5WXUojf3L8yuQmcTWljQ-mC67uDcMslFXZu8ackOKifNOIWdIzObCNnTy7d2B11birsFT3c1zYtXJjupPZXp2Fg9-7yJ-vgwgvbwzwo5fmsQRqipv_svdzqe2b8qyE0kzy7B7mUh93UPWBPwQsbHEORJf82DZUGCq8aPb7HMt3gfSPUzPhBCqZg7H3u7poDG4EBf1z9Nsr7jcyX7vkjR7vhDsoqHFXL5DNFy2aWktHBgAuiWnNT8n2KIyFSxJ1IcbDbGPkSleOgU-843Trq0h4oBD6ZdRRZWhgQegW51tj2TPMBblmZrBesfDCO8wLhOrTt4ePmMjavpcfAXRwJiePHLR3Cgs3p18BDO4WL-Dei1Ca6EoIrFQhE5t548FcZYwdYPMa7hbvjn2GsKwyw8NwEwe9iWRIH42wfraHG9I_3owz-2nNVT-m02_U7iCknokcXtwya1Cz0rU7c1e6jSGDZOAJHojJNjCFT19SnVRGfhL8tifrdViRWEKzCg_mWkHs7ui7kmHZVTKystDbEvSezfM1EzNWI8SaXBSCN6uJGIeJsMUCyKYm2j33amVUyxkEwbpSjPHEht3PcUo4wxJo7P27V4GlPToG-GwvJQ.mm0KkH-gTjxMPz06EVCEMg';

/**
 * Detail of the JWT token for DVR with KeysetEndpoint.
 *
 * const mockDvr =  {
 *   "zkvm": "sp1",
 *   "dvr_title": "My DVR",
 *   "dvr_id": "6ed14257-eea8-4dce-bc50-56d4d3891c94",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "92609d0e4ae3211016668d693007026d2a005f1ced6c6ed67e440c85bb63efe5",
 *   "query": [
 *     {
 *       "assign": {
 *         "query_result": {
 *           "and": [
 *             { "==": [{ "dvar": "country" }, "Indonesia"] },
 *             { "==": [{ "dvar": "city" }, "Jakarta"] },
 *             {
 *               "or": [
 *                 { "~==": [{ "dvar": "skills[0]" }, "Rust"] },
 *                 { "~==": [{ "dvar": "skills[1]" }, "Rust"] },
 *                 { "~==": [{ "dvar": "skills[2]" }, "Rust"] },
 *               ],
 *             },
 *           ],
 *         },
 *       },
 *     },
 *     { "output": { "title": "Job Qualification" } },
 *     { "output": { "name": { "dvar": "name" } } },
 *     { "output": { "is_qualified": { "lvar": "query_result" } } },
 *     { "output": { "result": { "lvar": "query_result" } } },
 *   ],
 *   "user_data_url": "https://hostname/api/user_data/",
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
const mockDvrWithKeysetJwt =
  'eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn0.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiI2ZWQxNDI1Ny1lZWE4LTRkY2UtYmM1MC01NmQ0ZDM4OTFjOTQiLCJxdWVyeV9lbmdpbmVfdmVyIjoiMC4zLjAtcmMuMSIsInF1ZXJ5X21ldGhvZF92ZXIiOiI5MjYwOWQwZTRhZTMyMTEwMTY2NjhkNjkzMDA3MDI2ZDJhMDA1ZjFjZWQ2YzZlZDY3ZTQ0MGM4NWJiNjNlZmU1IiwicXVlcnkiOiJbe1wiYXNzaWduXCI6e1wicXVlcnlfcmVzdWx0XCI6e1wiYW5kXCI6W3tcIj09XCI6W3tcImR2YXJcIjpcImNvdW50cnlcIn0sXCJJbmRvbmVzaWFcIl19LHtcIj09XCI6W3tcImR2YXJcIjpcImNpdHlcIn0sXCJKYWthcnRhXCJdfSx7XCJvclwiOlt7XCJ-PT1cIjpbe1wiZHZhclwiOlwic2tpbGxzWzBdXCJ9LFwiUnVzdFwiXX0se1wifj09XCI6W3tcImR2YXJcIjpcInNraWxsc1sxXVwifSxcIlJ1c3RcIl19LHtcIn49PVwiOlt7XCJkdmFyXCI6XCJza2lsbHNbMl1cIn0sXCJSdXN0XCJdfV19XX19fSx7XCJvdXRwdXRcIjp7XCJ0aXRsZVwiOlwiSm9iIFF1YWxpZmljYXRpb25cIn19LHtcIm91dHB1dFwiOntcIm5hbWVcIjp7XCJkdmFyXCI6XCJuYW1lXCJ9fX0se1wib3V0cHV0XCI6e1wiaXNfcXVhbGlmaWVkXCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX0se1wib3V0cHV0XCI6e1wicmVzdWx0XCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX1dIiwidXNlcl9kYXRhX3VybCI6Imh0dHBzOi8vaG9zdG5hbWUvYXBpL3VzZXJfZGF0YS8iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19fX0.Wu2d_ghW6jxBbJHvY_72LJCMtAzqh0fAcIj6Njhl0C4gPgHBhJtEMENC6Pkx-rxKZ4INX5OMcIySYSNXY3Dxag';
const mockDvrWithKeysetJweServer =
  'eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImVwayI6eyJ4IjoiazJGeVI3Z0h4ZEFxSlZlZGREcVRIdWpXQUR2cmlqQ3FhVm90cnpOb1VKVSIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ5IjoiVDlGNnU1VEJqTUpYbHJVbUtmY3gtX2JxcFFHY1ktSHpxWXpKUXVEWm1qUSJ9fQ..qkI756a96HOMG09o.Z9g57rjBDcgRD2TYLNitdWrAV87UeaiRNypAbol2kFQYksS2iyyFrhLMaKCVA9CSNsg7Lj1jolkLp56XvFMg94G-ux-yPBI3eF1wrBfyHYDlrU90LhBMZSl87osVbFTe5-HbVoKr5nrEYk5YuNNF7vYhGYMZLZlpTy38_1A8fW222xDAOWkvpT3Xw3kNuRtM4jfHKEXrOqg6TdbAvSoIrAXm1suqAPT8WePcc_dY99Snx5VQMAsF8WI88LAWFQascJqnAgxpXCnxcLmyA6Z0H_1h8mlnza0-AnzPOA4yCRlN1dblu1oKSIlvD2IcXFEOyOKoKrw7l47Sn7n7EM-RmQKRIiFoJJPZWqUXR3wpSrsiwSPsexfXy3iEaFvqGk53sTpiogW6CCX6np78VOAJwavlayw_z44UeBphfcvctfz4kT32697ZOD2-k5fS8hiQ21fRhQMPihmaRjEkJdZUejAXRsNbtDOqzZK0ySsHVo-RPMVUa9kbAhOewM-iQv3XYcqXE7hFJIZIQuQN2yJU7yDZiqkBHm5hMCR2slyw2Yjb0iGBW2Voqo1ePDD4rpLL0OTlMTmV3qA2W4xsKSb-CS8Nz8sIsqGukn8k37IvXhvmp54rrlldAGp_FQCQieiUF0WbxnafPXUzuzS_wHGYIT8vB1tEB2oVggtcETVYTc6W-sg5-L5_208n1JJKbnW5Scy5rR3zu26Yq9hk7wdrVLKA_LeNeKEacEMb0CWauDOEZuisFxs_xdxiP3bTBewPrL--y4eiKAhBC0BgmqSRH6z5CRXJdqzBK9RKqDA9Wg0E2LBYz6ZCQ7WmNr7AJ5wXcqZnvAzNZctirWTfdZ19zH2xUZGeYxpkpWyoCwLrKvXHttIfh9-yZGuoopdHP_QulBACaWspEwa9EWqEb7jsPlO6MHz2Xo4xLrBQdmZFJ-erCwcYHyHUcOYpeeMElorsxJWGwu5Tluu4A2HOTyJzPjzbuheCsOuO0jsh0bOiMQxAkr2qyqEOSpuTbmD9xufGYgfiVFME4kgrlOjQce-6a4Kir4vGRMFQ_De0MbQ_qVz0g5IlpNKo0Y7aEGqt7bdEjNEuhN9opOU3TT4Q27Gn2Jd70AvYPknJVF8otnhqRqwKIYHEZuOkhte6FrHogNB8ggjjfOjqWpRpY-eHupSQ3PBDCBOsMSGMD-lJ4V0JZxqJjIlCwXpk6spmoC3v9-o6N8ICpJGE7DL7rjrQ4Bu-ACf8y_TnEW8ZqFpPog9wg0kMCOeJiDuzqOIhVJujUXzn_iq4OF9TtpWXmAh5lmfvFmLlCPeNldmcscO_MamwIEOyZWAzTq3IW5QWUKAGVafmhIQvOLbE9AzixW2DFZp_J1mHk4xCgV1oWLz8UcvQe-dCNA-0LakIwXsN5LexSpDNXfLdEcQBLTHStxwnqzR6eUJKYSvbUSKC1RcRLjiG3boH2PsHD-qEK6q70nUy1ymCpNkSJKjNJ1hJ_N_3RXXu8LR6F7kptgsq_uMtJbeIOuSk28_kmmqgwWE3-TmS1Q5GX0TpZ3I0nwG4SvK0DuORUmeFeRBaNVlqsQnb92eteHwOaKT3xrML-bZAiXuxeCl8bV9-sXSCgCEKYntLG31M2HrsZZlAgRkb45zYS6QGR9ESC7Mp5WSZMS0q-EcK1mhw9fq18pOv34ZANK9L2kySPtzRQqeC2j4KnX6GUPneVyXJvzrTcAWBuHjfzGfFc2dzv4TmVFWkDIMCvPzP1xT1c1d37o_U8ptxg4qOMk3rK69so8dXtj-vFu-M2XFCTgaOMglaPGZFsbETRPw5aBVSEXnIyED24iddHR8-e33j_hhYUAPj1loQ23U3nQbYjuRsuDHlimSKSKeweM92g-ljbeaNH3voYvLkVi7397MXcOBqHamCvvn_bm0GCQwQJ8AdBNkZd4p_kW2Q2HSpjnoaDYuftbztWueG00-ZuEFdQ_BQwNfYrXNPDhNnQpp73wegF2ETIXz53zAs9zvc1VoQeFekJAR4AMOpm9aCAqZeEQQRhlUdAXoDP3A4lbc-yma0pWgalaTbb1GBQhcMisvOsttdGN4Jpnru903gT2XHNMsgn-UM9M2XYwLykt1KipnBZNHDDJk3Ky8zaKYRBhFBKYYpp_q18wBo7VO0CRGWQR2YHmrPAFofVxbC_yvu-biK_c-mbbzkNqR5h1-58vADbqPPN3flqN6wksRKlCK_2yUcNldc-2jMzO7XsJup7s6URMZcHsyxkVtiLU2NuFyjJMZsezExWJF18zz2zU5jOoT-MB1lWb6m4x1wpp0f0dKEaqujNrjo-aTE.DQcPaAYmeciev9BZT1xPAA';
const mockDvrWithKeysetJweLocal =
  'eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImVwayI6eyJ4IjoiTzBkcFRaX083WWZ6ZE5wSzlTdG9pRi1PLXJKeTFTRkxmM2MzMHRYbTdsVSIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ5Ijoiai1jYWt4NEEwZWJHMktWQVRrNDZET2lLOEFSM1hVbERYRDh0d25xQlAwWSJ9fQ..3XWOPPBvuX0yGES-.Z_i1U8SpWUMEQv2C27P6QFqOOSOhUZErXNX4b0iBiJVyuAel6oiuDplR_CBPY0ULyEFtC0TVSks3LYmar7JxyYxPHT7BBjTCGzjovO9Bb1g9Wz9Of765j53CxaafR74rODHd-Sl7qJpf2C7qYeOgNzAaPVpwdYt7zLEqn65fgKJ3Y9a49nnAPiNdHZJNFjKzj4TjOtAlZZ8AHrhXBt1YFBlxCdlPN4gnpfuNm7JM1mPPQ9e16C5DYrJ3ghPDLXAkxkp7RY-IZf5huC3-ZaoO228JAoxbC4lmPT1RiEZM11FN5AoDMUQimlM2RNoTMqKvjAmg0xujbAcu97bVo0qudfCOAWBzDSd3DSFG4Iw4OCpsmVhe6aId1mC2eiBTujXLsgMAVe9_tPeBsoWDsqVeV_8o7L_9jPx14NofrlprY8Fm3VxoKGAqco2J1L4be4UCPn6qQwDJ-2zTTDXSMXPTSApCd7CnS-AFAuEfPkEJgH025DmGIs2UW-ItEc7AjOS6q16B4CQ7ys3dIe_Dm4MLZFkIvyla9HHyzZwU1jWGw930qidoq7sjVUzyBU5Xgj_G_Wxdaaa1-Gs0-1l6Dbo7zXkaB_9LhzNQRGifMvVmpvgGdP-PLlbRsTMB96gAtdrX554imWbRzLnoBi0Xb-_Ic6ry_9xMuUZdx6Xq05xJrUuUnxd6y13fkcp4ofx8WMVbS9T-HFPBSqDSv27y59SuVZ2xGjUVKqgF66t3Q1CtsWEaI9NIUfNzWV0ge3aKRnceRC-QFK9Qvu0wREWFBhrr6K6ixQ-0crctRsDtoQ-H7xh4sMpzmKsA_vmb9Lz7_LCK3NUEOzrMe4imhdkr7gizu31bgsOfIpQoL8Uwo9etlXIPPFmasHimvpls2_YXpKR6u9mZEg5PhS9K--iWDre62qqdr2yZyEsoPXqj-6x6LPUcSLH0QmWhkApS-ZUat0f-2W7-RF_QoScyNF1OiMOgyGXkmGD29CrJWa6IWXVCdqJithp1fBoMTYRo8PLcRaVHDBIRxvZLGCjctIvFIIXMUrpDCUb1r37ribln5-l2oLjVmcflkHjtu0khuIlY02V41wOdhRMhAnQw8-bznEIBvrTm4dsGtKMlVpKsRSxRH7t9ZGDUTjY9Z44i-oXaURJH66lRtPs-pqR_-83fdJXwLvf6yxFPCCp8v3DGRttzQouwHX-KPcZiWXfWHPHU1Nw_xo4Bst5L_QXvTd_UvsMUNYAYF_hvomlWxzI7XeVnDu4qQgBq4OTKGaje37S8HTCnyW0tI9-XrKy2fknj1uiVGLRS4PXum7oGTg0TZYSh9mMx4sEcT-eSiwLviuMM9XqWYNj_kMeaYr3lXFO0rwxdoYDSE5s70Iz64t4kQf6R7YQVi_NApNcNNupJo86b2lgZrDLbG_LAROQkwYsQVwMRYvGMEkxSjuyK_lz3soJDzbgteJbep_HD9p8LrdKPfnqb3AeUrKp_95woCuXfDW2gS-QhFBl3z3NyjIqApXK18WVHbHYYq4e7FUXyHYdRJOG1gm3zW_OgTPZg0fyBI6NB_udNZK_lLveC6Y0NmVjHm4w61kCN32Q4L1qiGODfu668WH55rEMgYZDzrDS1nnf1OMwiqIWRMvJwmNkGHXWWg8RlKyr0VFpTdpN6fu-WWMw6kJ_xLUSFbA9d43ukhD2Fo8Gc_CCyASFbRDenN18oAtu1XsDB2JyFxocrfehxcLUUIj4mn5MNoP6fElWkxfZuPgtYOG7uWKTWxpxAbylucQ6DskSguRYQp2RhEC6oLPx0oP7AT4uWl-2TacYy6VTEgXV3dIQHHd8ly2CHCnWHqzXI7Eh6vn_8owzTfraZ6lCvNRU9iA5Wt4M1U7FeuhiEhmlGtelBM4lHQT4dyj_IMJTlTT52XYGUblAgih_JKvExb8_m2FZYyWjgkIv7DS_wMKmlcxYTeYE88qvL645IngRYIlsBjrcjDqUVle5kR8Oi-G7N8YYxmJQKgCBi5gxeK3r6gXa6RNtnALFMVsVI7qrhJedLT74ji-CctZlyVQMQgKQPDbxAnoJCE3F3okM4Z2yvbBJbJr8zeNvEByeURoGNlzKxjsjyd73neIfSW_NwNY3-9-lRmkERhIUd2kkz5Vn6pDNknbxtLHKGkJ1GndwGYu3K2FnVXG6i_6stkBQVOIDLeX2UrkPml5LU440MeEUjpdbB2lqUbvfqz_9CLmNvacZ_AwNFU7W8VoIpvvF1z7plHPxJc-p7ixD08npPb2Bf1ymcPtKTwSCsFdwDR7XwGQIA77ArvE5XiaBqEBEQ7GVjLEeCi9aJ.itY-LenGOBVys9qGLUS94w';

/**
 * Detail of the JWT token for Invalid DVR Format (Missing dvr_title).
 *
 * {
 *   "zkvm": "sp1",
 *   "dvr_id": "d4270951-1015-4dbc-881a-1d41ae8df1a8",
 *   "query_engine_ver": "0.3.0-rc.1",
 *   "query_method_ver": "92609d0e4ae3211016668d693007026d2a005f1ced6c6ed67e440c85bb63efe5",
 *   "query":  [
 *     {
 *       "assign": {
 *         "query_result": {
 *           "and": [
 *             { "==": [{ "dvar": "country" }, "Indonesia"] },
 *             { "==": [{ "dvar": "city" }, "Jakarta"] },
 *             {
 *               "or": [
 *                 { "~==": [{ "dvar": "skills[0]" }, "Rust"] },
 *                 { "~==": [{ "dvar": "skills[1]" }, "Rust"] },
 *                 { "~==": [{ "dvar": "skills[2]" }, "Rust"] },
 *               ],
 *             },
 *           ],
 *         },
 *       },
 *     },
 *     { "output": { "title": "Job Qualification" } },
 *     { "output": { "name": { "dvar": "name" } } },
 *     { "output": { "is_qualified": { "lvar": "query_result" } } },
 *     { "output": { "result": { "lvar": "query_result" } } },
 *   ],
 *   "user_data_url": "https://hostname/api/user_data/",
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
const mockInvalidDvrJwt =
  'eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn0.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfaWQiOiI2ZWM5NGFlYy04YjEwLTQ1YmYtODFkZC02MTc4MWRkNTA3OWEiLCJxdWVyeV9lbmdpbmVfdmVyIjoiMC4zLjAtcmMuMSIsInF1ZXJ5X21ldGhvZF92ZXIiOiI5MjYwOWQwZTRhZTMyMTEwMTY2NjhkNjkzMDA3MDI2ZDJhMDA1ZjFjZWQ2YzZlZDY3ZTQ0MGM4NWJiNjNlZmU1IiwicXVlcnkiOiJbe1wiYXNzaWduXCI6e1wicXVlcnlfcmVzdWx0XCI6e1wiYW5kXCI6W3tcIj09XCI6W3tcImR2YXJcIjpcImNvdW50cnlcIn0sXCJJbmRvbmVzaWFcIl19LHtcIj09XCI6W3tcImR2YXJcIjpcImNpdHlcIn0sXCJKYWthcnRhXCJdfSx7XCJvclwiOlt7XCJ-PT1cIjpbe1wiZHZhclwiOlwic2tpbGxzWzBdXCJ9LFwiUnVzdFwiXX0se1wifj09XCI6W3tcImR2YXJcIjpcInNraWxsc1sxXVwifSxcIlJ1c3RcIl19LHtcIn49PVwiOlt7XCJkdmFyXCI6XCJza2lsbHNbMl1cIn0sXCJSdXN0XCJdfV19XX19fSx7XCJvdXRwdXRcIjp7XCJ0aXRsZVwiOlwiSm9iIFF1YWxpZmljYXRpb25cIn19LHtcIm91dHB1dFwiOntcIm5hbWVcIjp7XCJkdmFyXCI6XCJuYW1lXCJ9fX0se1wib3V0cHV0XCI6e1wiaXNfcXVhbGlmaWVkXCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX0se1wib3V0cHV0XCI6e1wicmVzdWx0XCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX1dIiwidXNlcl9kYXRhX3VybCI6Imh0dHBzOi8vaG9zdG5hbWUvYXBpL3VzZXJfZGF0YS8iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19fX0.AB_XQe908GzDm_Nm7B9AU1PYbrIqAQbPQ_Ma3OaYGoNHkOfUioIVR35VRdxiSoWBZuh2ggmAdhRAgQoSgWG4sw';
const mockInvalidDvrJweLocal =
  'eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImVwayI6eyJ4IjoiemRYX3lfRlM0eWI1MjlvWXR4X016OEw3ZklUMXg3SXlUUUFUUnJpaDlDWSIsImNydiI6IlAtMjU2Iiwia3R5IjoiRUMiLCJ5IjoiUnBMNWRLU3RjMFJZVU9uR01IQWVZT2QtOWJnbW5yWEJJVWZnUFQ3bzRpTSJ9fQ..LsR5iIfJrjVLqz3x.OFfcVslOVuWmTlGCN1BfZ3lnCI9PGdDawh0JZGarEPqRbX0FWV7090axu0ctgVa_-6Z4t06A1K6zH3ArNMueEhia5MhZFUSn6ckZ_CyNH_Rp9HBaSXz-rVHdJnr_X8JZug7uLuJo-3NwAMBM3HcOBIrxIEuzr0yry-zgupFObhyo4VWAWiaBGa8Q5A9FwCaVywEDBGn7u6QeG7xE-B12ZX2qXy_Cu2lkGZVvEkVc6qtuQoZgULIX0XJe-lFPu9hDJ3HbTqDYa90pNewCtpL5bQggxoS8BHKEHsHOMCRzCei_GiwKLuukHLZGTf8wocvBF8B06Mm9qDXbMDH-EsqIgoh6xtupPTJZhvLzRwFxWT7VxbpqD1P-7YecwGPFhWp8yV1qiG4rMz0zc9oJC0SL-wxRo4FIVnZ6Ji_ZVjh6YwVKBoaj_Gwdn2Yg4IRpgBsSkaK9eXIRr5_zwBePtjtMlxGQeG8-3Mi68nsW7QQIsMKetPxx-mpf_vkRjGu5cuk1ykEdqZU5GBez_oVaVWAWycd4gTSrOfU6sPpf9txtG6-XY9s3D3qO49g0UWKtZXqaZKn1jTplN6sKcwJ1a61eTT7MUQ8N_KUj9jL8hEOrEX2k1xP2LuKkhGao5eUJHWos8-l3UzW0OMzdivlHiZzMZQPOHSbcfpAG0dgG5XHLCMeJY3-lGGg-CnYldVxmVKpiBOHqibh81_qh5s6XLmNuVf5S2YZs2KUeFAO8d3wE2tBbAF-pYP_0EKPgl2ExJUsaWv3tdeCWTu3DALyWWTE8iB7kF92BPiRUA7bO5l0pbhm6KoROMiLJtXTttDHgeOsgKnF2ZxJh_HtysYvKG1RScdHuPEmHFzDnzSkvqomXez2wjT4t_87o33iFlTIe7WMo7aXyi7M_HRrksKM5zdu4fcVpbyIVtJUnkcm-KYJrth32_veaEUiYGwqp7x49CT63ZStqpfzGzwII3xn1En8JrsOBRLvFtRhqP0MmtbliP84h_vvFv7xU-pj4rVCsi2Nh1YWigoGMp8E0-lWZxT_xrMtKQlzDFzqh7grRT-gnUUPWjk3wjtPqyvb-j8xUCXJB7MOz-gFAP5uVeVXXJevQcA8Vh5eGMyZocluBXbOu2sa4MkN-PQEHRYtuyU1QJtGpOc9Ho2-lCgCA02vSEtayJWfG7KRgl5T28LXPyNnNBZONrXCR_AwLSVcKWbucnLHUNGrpcF-z36iaNiefh5hcdi1Vzw0-aKg7oZIE_Ru_kbV3-2NkaxxwseVNn9UqvdFrDT73dIbjbiTjbP0IFXFmDLNvBw7JsDC-dDfhIjTlfBNMfEhljM_FxpzQkB4I8CTU952DfjpwQs0UUtoBVy_NGV79soLWtVMWU7z_sd-A2zKC65ZSeut7CC9hQ1NfIPS4qh5gzvVgqBRoOPBVncddcAoZVwfnpSbg6sp4kmAi-hT6eMS-RMubxPpPoK2m3GUjAj49oukMaFdmKItTUZlYyUPA7ZUGSudnaQoxQkRNeO38rWV6mKT6EYE5-UlhwTj8gIm6uIFuoo_0wi30Ddm4mNdORDejsOtZQ45szoRni9ZrJhPpKJfe1-PEn5YyJ5WYMlT7t9oK1QM5ooUK_zeoyazV3ojO5MD2gNFmPQrCG_6ZwvtC7smZT2K4DQZVNb04J0wPHppKxsXf8J2-cRI4T5oIO6gNL290iqzXc08SvUathskcXf25dg1D8SFdvUHe-LfdSHijLcmp9dToYpZzMF9Hdt2ijCUujEFc2FdbBeihkgwEqHuprnVwKbYybtUC1tF0lyW64Q6UnIKcw89kQ0WIlMYOVGCZyuVOtcjAm0z7SCIP_BgfCGihDmRCnbgOwffJ7YU5lhHVxtnte-5WSuGeY-oikZeGF5azN03S5-iXJYnArxIw6CfouSDF1kDgBIre215Htbl5oWYjM8mttg-jwV8fJx39et4Rzlu_TRmp29xRpnB0ZWrjBFkoJekZsrOZCimOPN53qEuDc4JyLrqwMBCx0MFXKz6o_2H-R4txbY7ZZ3N3IENEf95QNZmSUn-gqnp5WDpgoJ2o90brd6qkoH7QBdVUzFoGMiGseOrGkSB_zIv4nnXS2TVYzzFlFYiyVDJBkdJ7GaEFSO3723u-gdxnBguvZyy9Rf5-eDgDj3sk25bWffS0HpsXvQhYCnO1Ol0rv_mageps86KYrF234n52Kwami9iHs5YxIWeU4b78XMxWBUsoTbJKfXVyoCVtI1EQzglMatr05T82ElUxHAA3BYIAQRLZe-I.COp0Z4MHbqYlndoUq1gbdQ';
const mockInvalidDvrJweServer =
  'eyJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiRUNESC1FUyIsImVwayI6eyJrdHkiOiJFQyIsIngiOiJaOWc4aGJpTDlYQ1dFal9zeEIycGZ3cW5BeVhzdjhLUktqOFpnTHJ0RUVJIiwieSI6IkhIbXo5WTJJcER6UTY5RHRKZThPS05oSHZHYi1XbWFiUGlnUTNsTm9PSDAiLCJjcnYiOiJQLTI1NiJ9fQ..sldzzqvnAIgOF-s4.F_x_6CRrLEpgKkneOzwdYrhSUSRW33dWZm2zO7F-6mkhB4_1nB_ytDdGHoJRcjbsYfvMOU9mx4r8dwh_zB1tFpvWvW4cXH3ze1FbetRQ7LDM8ubDnMM3KqM_wgenhGEhpGlyaB0HTRmbcg2ov5Vpoz676Ajt0xUc6Xs09o4G_ebb_1OP93kcHlB0FS1nQ1ho26ccWGMrSRGrHO05Qwud2jfWjqHYUjaffFqTAVooD6IRTO_Bd0PNYwxAB99qfaqwmiPbHbvBs_Tbs_8ZHIvaebGM6N-q9VUGPHXxAcMRueD1TBsL0_LJzadX2IXSFdpjzqgykD-HIEwF1jrMMMvuehsMKzZoP0UwvX4zYJokh69gVqf1Q92Jj5PDHrkFDD-DdiX6o52U116n2hKK6ajBb048um-WWf-rtQsjdaE0zIV6fTZgAirG1_COJ-Ngg0u-rKAj_18mMtlnoLiZWCEp699UA2bjI4lDHjP7GFdb0hnbGe0vwmMRDSs4DUyoqsYdZfnC3Ce4lXJvKZUv0ycPHExVEdjHrIlIQFalt_RnYqRfsYL1_IIeAyYlcaozRTvcxk2YTCT7QOWsQTk6-fl4aAXrfX6LYpqyOLC0dPAKS39gDRlDDD9zOu8dUV7c02-AvYEqKXN-obmSmq8oofRyRWe0T8924B5UuSxomrXwn1I12Vg-gYhVSb4pQSgntGivRP5kcFUTF0AjipupT1oob78WFmO57qOMH3C5XXAP2rcRr2Q3F6BKqJGomE78DazEntmyugF9kW6qa0t2cZ-1a-WUOz87PwkRca4ugxeXhHrrKcArvE3hfTsDk7juFuNy14Ep_EeEyGu_EFNRhB6c91CKaw6UICr8OAZ1N1XdaauB8Q6b_jMSmwBAvCMVL4LL_8ZWVzXXchvp4rv2w2_wZogpQctbFN2LiJvNgirrmcRVb18DS8q_X1-YG5luVXpf0zCMZyl12SQl6s7fi4p3q0CqJi09rjMfAHaWHfDdT0R3RaaDfVV8PtCQTYGjd6DxUFsf9xQ5K8UULTONMatJf1aiPNkZS9G7wSO6xd8JGn9oId7MEmU8zw17xNN822RBqSTU5mVXS-Zb8IG6ZrgOvfj90DxRXLQl4d9buKZRLp3HXWhJTAx39amThS-_XQow1PVJ4e9Qd30fXP7Il0F0fH07TeAWa9XFZtngcfs_6fOW4VSmoeeSqvTihtMg6pqLBwot-Onn-CLm3JZf2JjT2CpNXPI_71PRb7KO-6bS1cH6OC1c2PZbAHORCFnSEoc1xj2fxQMU9G-Y1wzC4eb73CVrDPFNx5ddHiI2Slq23C9dBKmMxaUNEaZIMyblp5v9Y3FV5HAo4qubOmMgxfSydgvzNR0fa5ptXBRhwH38DbFOf-UArgQRZm1ldhB2cJXLNMuPqw9KdoxtdTGDLAdjDbJvv33MWXZ1e6QT53U261SP21DY9P3kaaxFiQ1aMw_4RibE6uvKWqBBJwNFwhiiIB5Zu9CPVwx4z-pXvgjChho4IUG9sb_6qab3IHxoUf6H7bgAatmK58tFaF_lVUK5zipCrbvgGufy1omEv_xvtEyjPMAnYmzD8CZoYUjhLO0t8YW4bBhXSSpndsD7-odHTtk8fFRzFHz-htbVJv5KOn31EvefD_RLiUEwKNU3h2_kdbryHrfGjVzZSkFDyu1PeLJZ1a-bF7CqJ9P5ecXWvkeMwaVAZGrq_ePEu0ZjwCm99tuQV8evrN5H5kqrU5shSpr-OrDxpGWBukDQCv9_ABBwg84_G3sJt8OdVsUzEyAdrbEvYJxeEzlB8g60e47-Qt41Yg8CZc-3Lm62D42PIpva2PRhryXq7SpoyxdUCGzviIj7LGBtyjATmrXLNHq3sO1oQI5pphFfGTrayU8F1C1XFIIqvQKpyoEsyP7st9xWhS4XfNgiTBc45xpnuDl4Bp2MozSqD2C5UC2mUVSPLBUcTQWAj0EvLV9jEOWMD1lL8Mut-E1CW2Z9yRq9DwU1D9z6MkaKA7QYfKvA2mtvrUqC2P7WVWq_FOe5IMYprNC3rAF0fOGAtERi1-ckSZK6pJsbkrb48lou8lSIucPYtJEuaqsC1rtX1LbnK476l-frWZytEZODVkbBQP33zUGh3suFxqKlCLCp32xrYI8dI-Uwjwy-ei3XUcwWcoBZKVlrPlTf5PdNwYuvRh8bgTVTinzl5uSuY64bb0bl5EAv2d9j9DQzQdogYPLteYC3NxZ50gekfV3a9fMJTcPskvUto_KeSnzpiilpdIhK8ig.cS0INu3Q5BbCCgt8hUJ7Bw';

/**
 * Detail of Proof result from zkPass
 */
const proofResult = {
  status: 200,
  proof: 'very_long_proof',
};

const badUserDataError = {
  status: 400,
  statusText:
    'Custom Error: ZkPassError: QueryEngineError("DataVariableResolutionError")',
  statusCode: 'E2008-ECustomError',
};
const badUserDataErrorResponse = `${badUserDataError.status} ${badUserDataError.statusCode}: ${badUserDataError.statusText}`;

const invalidDvrError = {
  status: 400,
  statusText: 'Custom Error: ZkPassError: MissingRootDataElementError',
  statusCode: 'E2008-ECustomError',
};
const invalidDvrErrorResponse = `${invalidDvrError.status} ${invalidDvrError.statusCode}: ${invalidDvrError.statusText}`;

export {
  mockDvrWithPublicKeyJwt,
  mockDvrWithPublicKeyJweServer,
  mockDvrWithPublicKeyJweLocal,
  mockDvrWithKeysetJwt,
  mockDvrWithKeysetJweServer,
  mockDvrWithKeysetJweLocal,
  mockInvalidDvrJwt,
  mockInvalidDvrJweLocal,
  mockInvalidDvrJweServer,
  proofResult,
  badUserDataError,
  badUserDataErrorResponse,
  invalidDvrError,
  invalidDvrErrorResponse,
};
