"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { Stage } from "@/lib/timetable"; 

type Role = "student" | "parent" | "teacher";

type Profile = {
  id: string;
  full_name: string | null;
  role: Role | null;
  school_name: string | null;
  phone: string | null;
  education_stage: Stage | null;
};

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, role, school_name, phone, education_stage")
          .eq("id", session.user.id)
          .maybeSingle();

        if (mounted) setProfile((data as Profile) ?? null);
      }

      if (mounted) setLoading(false);
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);

        if (session?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("id, full_name, role, school_name, phone, education_stage")
            .eq("id", session.user.id)
            .maybeSingle();

          setProfile((data as Profile) ?? null);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
