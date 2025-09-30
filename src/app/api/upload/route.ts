import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// GET /api/library
export async function GET() {
  const { data, error } = await supabase.from("library_rooms").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// POST /api/library
export async function POST(req: Request) {
  const body = await req.json();
  const { data, error } = await supabase
    .from("library_rooms")
    .insert(body)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
