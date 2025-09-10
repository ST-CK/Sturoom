"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

type Profile = {
  full_name: string | null;
  role: string | null;
  school_name: string | null;
  phone: string | null;
};

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      setUser(data.session?.user ?? null);

      if (data.session?.user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, role, school_name, phone")
          .eq("id", data.session.user.id)
          .maybeSingle<Profile>();

        setProfile(prof ?? null);
      }

      setLoading(false);
    };

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("profiles")
          .select("full_name, role, school_name, phone")
          .eq("id", session.user.id)
          .maybeSingle<Profile>()
          .then(({ data }) => setProfile(data ?? null));
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
