/**
 * /app/api/auth/login/route.ts
 *
 * ログインエンドポイント
 * "POST /api/auth/login" で{email, password}を受け取り、
 * Supabse Auth の　signInWithPassword() メソッドを利用してログインを行う
 */

import { NextResponse, NextRequest } from 'next/server';
import supabase from '@/lib/supabase';
import { access } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディから email と password を取得
    const { email, password } = await request.json();

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Supabase Auth のsignInWithPassword()メソッドを利用してログイン
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user) {
      // 認証失敗時
      return NextResponse.json(
        { message: error?.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    // ログイン成功時には session 情報と user 情報が返る
    // session.access_token をフロントで保存すると認証状態を管理できる
    return NextResponse.json(
      {
        user: data.user,
        access_token: data.session.access_token,
        token_type: data.session.token_type, // Bearer
        expires_in: data.session.expires_in, // 3600
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
