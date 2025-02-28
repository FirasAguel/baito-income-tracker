// middleware.ts（プロジェクトルートまたは app/ ディレクトリ直下に配置）
/**import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import supabase from '@/lib/supabase';

// 公開ページ（認証不要）のパス一覧
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgotpassword', // パスワードリセット用画面
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next.js内部の静的ファイルやAPIルートは対象外
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 公開ページの場合は認証チェックをスキップ
  if (PUBLIC_PATHS.some((publicPath) => pathname.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // Cookieから認証トークンを取得
  const token = request.cookies.get('token')?.value;
  console.log('token:', token);
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Supabaseでトークンを検証
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // 認証済みの場合はそのままリクエストを通す
  return NextResponse.next();
}

// すべての保護対象ルートに適用する matcher の設定
export const config = {
  matcher: ['/', '/shift/:path*', '/settings/:path*'],
};*/

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 環境変数から Supabase クライアントの情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next.js 内部の静的ファイル、API ルートは対象外
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 保護対象のルート（例：ホーム、シフト、設定）
  const protectedPaths = ['/', '/shift', '/settings'];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // 公開ページ（認証不要）
  const publicPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/employee/login',
    '/admin/login',
    '/timecard/login',
  ];

  // Cookie から認証トークンを取得（ログイン時に必ず Cookie にセットする）
  const token = request.cookies.get('token')?.value;

  // 未認証の場合、保護対象ページへのアクセスなら /login へリダイレクト
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // トークンがある場合、Supabase Auth で検証
  if (token) {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      // 無効なトークンの場合、Cookie を削除して /login にリダイレクト
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // 認証済みユーザーが公開ページにアクセスしようとした場合はホーム（"/"）へリダイレクト
  if (token && publicPaths.some((pubPath) => pathname === pubPath || pathname.startsWith(pubPath + '/'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/shift/:path*', '/settings/:path*'],
};