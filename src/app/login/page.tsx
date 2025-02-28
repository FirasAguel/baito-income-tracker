'use client';
/**
 * ログイン画面
 * 
 * ユーザーがメールアドレスとパスワードを入力し "/api/login" にPOST。
 * 成功時はローカルストレージにトークンを保存してダッシュボードへ移動する例。
 */

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../Auth/AuthProvider';

export default function LoginPage() {
  const router = useRouter();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
      const data = response.data;

      if (response.status >= 400) {
        setError(data.message || 'ログインに失敗しました。');
        return;
      }
      // 成功時
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      const token = data.token;
      // プロフィール情報の構築
      const profile = {
        userId: data.user.employee_id || data.user.admin_id, // ユーザーの ID
        username: data.user.name,                       // ユーザー名                     
        token: token,                              // 認証トークン
      };
      // ログイン処理
      login(profile);
      // ログイン後の画面へ遷移
      router.push('/homepage');
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'ログインに失敗しました。');
      } else {
        setError('ログインに失敗しました。');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 bg-white p-4 shadow">
      <h2 className="text-2xl mb-4">ログイン</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>メールアドレス</label>
          <input
            type="text"
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
        {/* パスワードリセットおよびサインアップリンク */}
        <div className="flex items-center justify-between">
          <Link href="/forgotpassword" className="text-sm text-blue-600 hover:text-blue-800">
            パスワードをお忘れの方
          </Link>
          <Link href="/signup" className="text-sm text-blue-600 hover:text-blue-800">
            アカウントを作成
          </Link>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">
          ログイン
        </button>
      </form>
    </div>
  );
}