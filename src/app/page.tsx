import BookmarkApp from "@/components/bookmark-app";
import { createClient } from "@/lib/supabase/server";
import type { AppUser, Bookmark } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialUser: AppUser | null = null;
  let initialBookmarks: Bookmark[] = [];

  if (user) {
    initialUser = { id: user.id, email: user.email ?? null };
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });
    initialBookmarks = data ?? [];
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <BookmarkApp initialUser={initialUser} initialBookmarks={initialBookmarks} />
    </main>
  );
}
