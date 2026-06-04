import EmployeeLayout from "../../components/employee/EmployeeLayout";
import { requireEmployee } from "../../lib/auth/session";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireEmployee();

  return <EmployeeLayout>{children}</EmployeeLayout>;
}
