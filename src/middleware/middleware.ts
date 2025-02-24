import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function withAuth(request: Request, next: () => Promise<Response>) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: '認証情報がありません' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: '認証に失敗しました' }, { status: 401 });
  }
  // 必要であれば、request にユーザー情報を付与する処理を実装
  return next();
}