/**
 * /app/api/auth/forgotpassword/route.ts
 *
 * パスワードリセットエンドポイント
 * "POST /api/auth/forgotpassword" に{email}を渡すと、
 * supabase.auth.のresetPasswordForEmail() メソッドを利用してパスワードリセットを行う
 * 成功すると、ユーザー宛にパスワード再設定リンクが記載されたメールが送信される
 */

import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    //リクエストのJSONボディからemailを取得
    const { email } = await request.json();
    //バリデーション
    if (!email) {
      return NextResponse.json(
        { message: 'メールアドレスが必要です' },
        { status: 400 }
      );
    }
    //Supabase AuthのresetPasswordForEmail()メソッドを利用してパスワードリセット
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `http://localhost:3000/forgotpassword/reset`, //パスワードリセット後のリダイレクト先
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    //成功時のレスポンス
    return NextResponse.json(
      { message: 'パスワードリセット用のメールを送信しました' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
