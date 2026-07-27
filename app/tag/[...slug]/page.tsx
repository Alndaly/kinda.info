import { redirect } from 'next/navigation';

export default function LegacyTagPage() {
  redirect('/notes');
}
