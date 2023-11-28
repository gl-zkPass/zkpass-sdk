/*
 * Filename: typescript/node-js/client/src/app/onboarding/page.tsx
 * Path: typescript/node-js/client
 * Created Date: Monday, November 27th 2023, 4:42:11 pm
 * Author: Naufal Fakhri Muhammad
 *
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { cookies } from "next/headers";
import EmployeeOnboarding from "./employeeOnboarding.component";

export default function Users() {
  interface CookieValue {
    name: string;
    value: string;
  }
  const user: undefined | CookieValue = cookies().get("username");

  return <EmployeeOnboarding user={user?.value} />;
}
