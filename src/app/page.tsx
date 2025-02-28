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
        router.push('/login'); // 🚀 未登录，跳转到登录页
      } else {
        router.push('/shift/page'); // ✅ 已登录，跳转到 shift/page
      }
    };

    checkUser();
  }, [router]);

  return <p>Loading...</p>; // ✅ 等待检查登录状态
}
