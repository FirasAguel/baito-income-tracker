'use client';
/**
 * /app/signup/page.tsx
 * サインアップ画面
 * 
 * ユーザーがメールアドレス・パスワードを入力し "/api/signup" にPOSTする。
 * 成功時にログイン画面へ誘導するシンプルな例。
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();

  // State: email, password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');



  /**
   * サインアップフォームの送信処理
   * 
   * async: 非同期処理を行う関数
   * e: React.FormEvent<HTMLFormElement> フォームの送信イベント
   * HTMLFormElement: フォーム要素
   * 
   * async(e: React.FormEvent<HTMLFormElement>) =>{} は、
   * フォームの送信イベントを受け取り、非同期処理を行う関数を定義している。
   * @param e 
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();   // デフォルトの送信処理をキャンセル
    setError('');     // エラーメッセージをリセット
    setSuccess('');   // 成功メッセージをリセット

    try {
      // サインアップリクエストを送信
      const response = await axios.post('/api/auth/signup', { email, password });
      if (response.status === 200) {
        setSuccess('登録が成功しました。ログインしてください。');
        router.push('/login');
      }
    } catch (err: any) {
      // エラーメッセージを表示
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'サインアップに失敗しました。');
      } else {
        setError('サインアップに失敗しました。');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-4 shadow">
      <h2 className="text-2xl mb-4">サインアップ</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>メールアドレス</label>
          <input
            type="email"
            className="border px-2 py-1 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>パスワード</label>
          <input
            type="password"
            className="border px-2 py-1 w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
          サインアップ
        </button>
      </form>
      {/* ログインページへのリンク */}
      <div className="mt-4 text-center">
        既にアカウントをお持ちですか？{' '}
        <Link href="/login" className="text-blue-600 hover:text-blue-800">
          ログイン
        </Link>
      </div>
    </div>
  );
}