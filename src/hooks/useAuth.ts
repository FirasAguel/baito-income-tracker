import { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { User } from "@supabase/supabase-js"; // ✅ 确保导入 Supabase User 类型

export function useAuth() {
  const [user, setUser] = useState<User | null>(null); // ✅ 设置正确的类型
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user); // ✅ 现在不会报错了
      }
      setLoading(false);
    };

    fetchUser();

    // 监听用户状态变化
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null); // ✅ 兼容 null
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login error:", error.message);
      return false;
    }
    setUser(data.user); // ✅ 这里也不会报错
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); // ✅ 现在 setUser 兼容 null
  };

  return { user, loading, login, logout };
}
