/**
 * /app/api/logout/route.ts
 *
 * ログアウトエンドポイント
 * "POST /api/logout" にリクエストすると、
 * supabase.auth.signOut() メソッドを利用してログアウトを行う
 * 必要に応じでCookieを削除したり、ログアウトメッセージを返す
 */
import { NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST() {
  try {
    // 現在のセッションでログアウト
    const { error } = await supabase.auth.signOut();
    // エラーがあればエラーメッセージを返す
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // 必要に応じて Cookie を削除したり、ログアウトメッセージを返したり
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
    // 例: token クッキーを空 + 期限切れに設定
    response.cookies.set('token', '', { expires: new Date(0), path: '/' });
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
