// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push('/login');
      } else {
        router.push('/shift'); 
      }
    };

    checkUser();
  }, [router]);

  return <p>Loading...</p>; 
}
