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
