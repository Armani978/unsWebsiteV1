import CheckoutPage from '../../components/store/CheckoutPage';
import { requireCustomer } from '../../lib/auth/session';

export default async function Checkout() {
  await requireCustomer();

  return <CheckoutPage />;
}
