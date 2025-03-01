'use client';
/**
 * Logout自動リダイレクト:
 * ボタンクリックで "/api/logout" を呼び出し、認証セッションを破棄した上で
 * ローカルストレージのトークンを削除し、ログイン画面へ戻る例。
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      // サーバー側の /api/logout を呼んで signOut()
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // フロント側のトークンも削除
      localStorage.removeItem('token');

      // ログインページへ移動
      router.push('/login');
    };

    handleLogout();
  }, [router]);

  return null; // 画面に何も表示しない
}
