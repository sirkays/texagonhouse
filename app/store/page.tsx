import { Suspense } from 'react';
import StoreClient from './StoreClient';

// Avoid prerender/SSG on this route if you're using NextAuth or URL hooks:
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function StorePage() {
  return (
    <Suspense fallback={<div>Loading store…</div>}>
      <StoreClient />
    </Suspense>
  );
}
