'use client';
/**
 * /app/forgotpassword/reset/page.tsx
 *
 *
 * ResetPasswordPage:
 * メールに記載されたリンク(redirectTo) でアクセスする画面。
 * ユーザーが新しいパスワードを入力し、supabase.auth.updateUser({ password }) で更新します。
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();

  // 新しいパスワード用State
  const [newPassword, setNewPassword] = useState('');
  // メッセージ表示用
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // supabase.auth.updateUser() を呼ぶと、現在の一時セッションでパスワードを更新できる
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setError(error.message || 'パスワードの更新に失敗しました。');
        return;
      }

      // 成功
      setSuccess('パスワードを更新しました。');
      // 数秒後にログインページへ遷移する例
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError('サーバーエラーが発生しました。');
      console.error('Update password error:', err);
    }
  };

  // 更新成功時に表示
  if (success) {
    return (
      <div className="mx-auto mt-8 max-w-md bg-white p-4 shadow">
        <h2 className="mb-4 text-2xl">パスワード再設定</h2>
        <p className="mb-4 text-green-600">{success}</p>
        <p>ログインページへ移動中...</p>
      </div>
    );
  }

  // 通常フォーム
  return (
    <div className="mx-auto mt-8 max-w-md bg-white p-4 shadow">
      <h2 className="mb-4 text-2xl">新しいパスワードを設定</h2>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="mb-1 block">新しいパスワード</label>
          <input
            type="password"
            className="w-full border px-2 py-1"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="rounded bg-teal-500 px-4 py-2 text-white"
          type="submit"
        >
          パスワードを更新
        </button>
      </form>
    </div>
  );
}
