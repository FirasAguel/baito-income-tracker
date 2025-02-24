/**
 * /app/api/auth/signup/route.ts
 * 
 * サインアップエンドポイント
 * "POST /api/auth/signup" で{email, password}を受け取り、
 * Supabse Auth の　signUp() メソッドを利用してサインアップを行う
 * 
 */

import { NextRequest, NextResponse } from 'next/server';
import  supabase  from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try{
        //リクエストボディからemailとpasswordを取得
        const {email, password} = await request.json();

        //バリデーション
        if (!email || !password) {
            return NextResponse.json({message: 'Email and password are required'}, {status:400});
        }
        //Supabase AuthのsignUp()メソッドを利用してサインアップ
        const {data,error} = await supabase.auth.signUp({email, password});
        if (error) {
            return NextResponse.json({error: error.message}, {status:400});
        }

        //成功時のレスポンス
        return NextResponse.json({data}, {status:200});
    } catch (err) {
        console.error('Signup error:', err);
        return NextResponse.json({message: 'Server error'}, {status:500});
    }
}