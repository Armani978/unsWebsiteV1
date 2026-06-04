import { redirect } from 'next/navigation';
import { requireEmployee } from '../lib/auth/session';

export default async function EmployeePage() {
  await requireEmployee();
  redirect('/employee/dashboard');
}
