'use client';
/**
 * LogoutButtonコンポーネント:
 * ボタンクリックで "/api/logout" を呼び出し、認証セッションを破棄した上で
 * ローカルストレージのトークンを削除し、ログイン画面へ戻る例。
 */

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // サーバー側の /api/logout を呼んで signOut()
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });

    // フロント側のトークンも削除
    localStorage.removeItem('token');

    // ログインページへ移動
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className="bg-gray-200 px-4 py-2">
      ログアウト
    </button>
  );
}
