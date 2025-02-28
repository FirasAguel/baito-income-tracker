'use client';
/**
 * /app/signup/page.tsx
 * サインアップ画面
 *
 * ユーザーがメールアドレス・パスワードを入力し "/api/signup" にPOSTする。
 * 成功時にログイン画面へ誘導するシンプルな例。
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    console.log('SignUp Response:', data, error);

    setSuccess('登録が成功しました。ログインしてください。');
    setTimeout(() => router.push('/login'), 2000);
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-center text-2xl font-bold">サインアップ</h2>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {success && <p className="mb-4 text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            className="w-full rounded border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">パスワード</label>
          <input
            type="password"
            className="w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded bg-blue-500 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? '登録中...' : 'サインアップ'}
        </button>
      </form>

      <div className="mt-4 text-center">
        既にアカウントをお持ちですか？{' '}
        <Link href="/login" className="text-blue-600 hover:underline">
          ログイン
        </Link>
      </div>
    </div>
  );
}
