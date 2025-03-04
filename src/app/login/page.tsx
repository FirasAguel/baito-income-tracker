'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 登录处理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error getting user:', error.message);
      setError(error.message);
      setLoading(false);
      return;
    }

    // 用户登录成功后，检查 profiles 表中是否存在此用户的记录
    const { error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    // 如果没有找到用户的资料，插入默认的资料
    if (profileError && profileError.code === 'PGRST116') {
      console.error('Error fetching profile:', profileError.message);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ user_id: data.user.id, name: data.user.email }]); // 使用邮件作为默认名称

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        setError('プロフィール作成に失敗しました。');
        setLoading(false);
        return;
      }
    }

    // 登录成功后跳转到 home 页面
    router.push('/home');
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-center text-2xl font-bold">ログイン</h2>

      {error && <p className="mb-4 text-red-600">{error}</p>}

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

        {/* 忘记密码 & 注册 */}
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgotpassword"
            className="text-teal-600 hover:underline"
          >
            パスワードをお忘れの方
          </Link>
          <Link href="/signup" className="text-teal-600 hover:underline">
            アカウントを作成
          </Link>
        </div>

        {/* 登录按钮 */}
        <button
          type="submit"
          className="w-full rounded bg-teal-500 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}
