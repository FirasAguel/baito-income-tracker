// src/app/page.tsx
/**
 * ユーザータイプを選択させて、それに応じたページを表示する
 * 従業員の場合 -> employee/login
 * 管理者の場合 -> login
 */
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Page() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };
  const handleSignUpClick = () => {
    router.push('/signup');
  }

 

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          
          <h1 className="text-3xl font-bold text-blue-600 mt-2">サービス名</h1>
        </div>
      </div>
      <h2 className="text-2xl font-semibold mb-6">ログイン、サインアップを選択してください</h2>
      <div className="flex space-x-4">
        <button
          onClick={handleLoginClick}
          className="px-6 py-3 bg-blue-500 text-white rounded-md"
        >
          ログイン
        </button>
        
        <button
          onClick={handleSignUpClick}
          className="px-6 py-3 bg-green-500 text-white rounded-md"
        >
          サインアップ
        </button>
      </div>
            <style>{`
        main {
          padding-left: 0!important;
        }
      `}</style>
    </div>
  );
}
