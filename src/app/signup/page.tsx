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
    
    
    console.log("SignUp Response:", data, error);
    
    setSuccess('登録が成功しました。ログインしてください。');
    setTimeout(() => router.push('/login'), 2000);
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">サインアップ</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            className="border px-3 py-2 w-full rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">パスワード</label>
          <input
            type="password"
            className="border px-3 py-2 w-full rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "登録中..." : "サインアップ"}
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
