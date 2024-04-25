/*
 * constants.tsx
 * File containing keys and urls for wallet demo
 *
 * Authors:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * Created at: January 20th 2024
 * -----
 * Last Modified: April 25th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

/**
 * Detail of the JWT token for User Data which contains User Personal Data
 *
 * {
 *   name: 'Ramana',
 *   _name_zkpass_public_: true,
 *   email: 'ramana@example.com',
 *   city: 'Jakarta',
 *   country: 'Indonesia',
 *   skills: ['Rust', 'JavaScript', 'HTML/CSS'],
 * };
 */
export const USER_DATA_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Im5hbWUiOiJSYW1hbmEiLCJfbmFtZV96a3Bhc3NfcHVibGljXyI6dHJ1ZSwiZW1haWwiOiJyYW1hbmFAZXhhbXBsZS5jb20iLCJjaXR5IjoiSmFrYXJ0YSIsImNvdW50cnkiOiJJbmRvbmVzaWEiLCJza2lsbHMiOlsiUnVzdCIsIkphdmFTY3JpcHQiLCJIVE1ML0NTUyJdfX0.20QgfcpYqVIX0SxA7fSKgULmkw6BcQFq4MFtb6NLv9bhp0iGXwGSc9xT7eHjnkKpKPi8yvNPb3f8K0Y5XYkrpA';

/** 
 * DVR Token is in JWT Format which contains Query for the User Data
 * In this example, The query is to check:
 * 1. Country is Indonesia
 * 2. City is Jakarta
 * 3. Has Rust as one of the skills 
 */
export const DVR_TOKEN =
  'eyJhbGciOiJFUzI1NiIsImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn0.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiI2ZWQxNDI1Ny1lZWE4LTRkY2UtYmM1MC01NmQ0ZDM4OTFjOTQiLCJxdWVyeV9lbmdpbmVfdmVyIjoiMC4zLjAtcmMuMSIsInF1ZXJ5X21ldGhvZF92ZXIiOiI5MjYwOWQwZTRhZTMyMTEwMTY2NjhkNjkzMDA3MDI2ZDJhMDA1ZjFjZWQ2YzZlZDY3ZTQ0MGM4NWJiNjNlZmU1IiwicXVlcnkiOiJbe1wiYXNzaWduXCI6e1wicXVlcnlfcmVzdWx0XCI6e1wiYW5kXCI6W3tcIj09XCI6W3tcImR2YXJcIjpcImNvdW50cnlcIn0sXCJJbmRvbmVzaWFcIl19LHtcIj09XCI6W3tcImR2YXJcIjpcImNpdHlcIn0sXCJKYWthcnRhXCJdfSx7XCJvclwiOlt7XCJ-PT1cIjpbe1wiZHZhclwiOlwic2tpbGxzWzBdXCJ9LFwiUnVzdFwiXX0se1wifj09XCI6W3tcImR2YXJcIjpcInNraWxsc1sxXVwifSxcIlJ1c3RcIl19LHtcIn49PVwiOlt7XCJkdmFyXCI6XCJza2lsbHNbMl1cIn0sXCJSdXN0XCJdfV19XX19fSx7XCJvdXRwdXRcIjp7XCJ0aXRsZVwiOlwiSm9iIFF1YWxpZmljYXRpb25cIn19LHtcIm91dHB1dFwiOntcIm5hbWVcIjp7XCJkdmFyXCI6XCJuYW1lXCJ9fX0se1wib3V0cHV0XCI6e1wiaXNfcXVhbGlmaWVkXCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX0se1wib3V0cHV0XCI6e1wicmVzdWx0XCI6e1wibHZhclwiOlwicXVlcnlfcmVzdWx0XCJ9fX1dIiwidXNlcl9kYXRhX3VybCI6Imh0dHBzOi8vaG9zdG5hbWUvYXBpL3VzZXJfZGF0YS8iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJLZXlzZXRFbmRwb2ludCI6eyJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEifX0sImR2cl92ZXJpZnlpbmdfa2V5Ijp7IktleXNldEVuZHBvaW50Ijp7ImprdSI6Imh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9nbC16a1Bhc3MvemtwYXNzLXNkay9tYWluL2RvY3MvemtwYXNzL3NhbXBsZS1qd2tzL3ZlcmlmaWVyLWtleS5qc29uIiwia2lkIjoiay0xIn19fX0.Wu2d_ghW6jxBbJHvY_72LJCMtAzqh0fAcIj6Njhl0C4gPgHBhJtEMENC6Pkx-rxKZ4INX5OMcIySYSNXY3Dxag';
export const ZKPASS_URL = 'https://playground-zkpass.ssi.id';
export const ZKPASS_API_KEY = '5ecb2229-ddee-460e-b598-a0001c10fff1';
export const ZKPASS_API_SECRET = '074a53a8-a252-45de-a9d5-0961a6362df6';