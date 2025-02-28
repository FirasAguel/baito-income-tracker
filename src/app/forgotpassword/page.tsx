'use client';
/**
 * /app/forgotpassword/page.tsx
 * ForgotPasswordPage:
 * ユーザーが「メールアドレス」を入力し、
 * /api/forgotpassword にリクエストを送信する画面です。
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // メールアドレス入力用State
  const [email, setEmail] = useState('');
  // エラー表示用
  const [error, setError] = useState('');
  // フォーム送信後かどうか
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      // APIへメールアドレスを送信
      const response = await fetch('/api/auth/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'エラーが発生しました');
        return;
      }

      // メール送信完了
      setIsSubmitted(true);
    } catch (err) {
      setError('エラーが発生しました');
    }
  };

  // メール送信完了時の表示
  if (isSubmitted) {
    return (
      <div className="mx-auto mt-8 max-w-md bg-white p-4 shadow">
        <h2 className="mb-4 text-2xl">パスワード再設定</h2>
        <p className="mb-4">
          入力されたメールアドレスに再発行用のリンクを送信しました。
        </p>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          onClick={() => router.push('/login')}
        >
          ログインへ戻る
        </button>
      </div>
    );
  }

  // 通常のフォーム表示
  return (
    <div className="mx-auto mt-8 max-w-md bg-white p-4 shadow">
      <h2 className="mb-4 text-2xl">パスワード再設定</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>メールアドレス</label>
          <input
            type="email"
            className="w-full border px-2 py-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button
          className="rounded bg-blue-500 px-4 py-2 text-white"
          type="submit"
        >
          リセットメールを送信
        </button>
      </form>
    </div>
  );
}
