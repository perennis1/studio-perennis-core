// src/app/orders/confirmation/page.tsx
import { Suspense } from 'react';
import ConfirmationContent from './ConfirmationContent';

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white pt-28 px-6"><p className="text-center text-gray-400 mt-24">Loading order...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
