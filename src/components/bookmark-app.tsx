"use client";

import { createClient } from "@/lib/supabase/client";
import type { AppUser, Bookmark } from "@/lib/types";
import { useCallback, useEffect, useMemo, useState } from "react";

type BookmarkAppProps = {
  initialUser: AppUser | null;
  initialBookmarks: Bookmark[];
};

export default function BookmarkApp({
  initialUser,
  initialBookmarks,
}: BookmarkAppProps) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<AppUser | null>(initialUser);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setBookmarks(data ?? []);
  }, [supabase, user]);

  useEffect(() => {
    setUser(initialUser);
    setBookmarks(initialBookmarks);
  }, [initialBookmarks, initialUser]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? { id: session.user.id, email: session.user.email ?? null }
          : null,
      );
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`bookmarks-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          void fetchBookmarks();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchBookmarks, supabase, user]);

  async function handleGoogleAuth() {
    setErrorMessage(null);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleLogout() {
    setErrorMessage(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setErrorMessage(error.message);
    }
    setBookmarks([]);
  }

  async function handleAddBookmark(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const parsedUrl = new URL(url);
      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          title: title.trim(),
          url: parsedUrl.toString(),
          user_id: user.id,
        })
        .select("*")
        .single();

      if (error) throw error;

      if (data) {
        setBookmarks((prev) => [data, ...prev]);
      }
      setTitle("");
      setUrl("");
    } catch (error) {
      if (error instanceof Error) setErrorMessage(error.message);
      else setErrorMessage("Failed to add bookmark.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteBookmark(id: string) {
    setErrorMessage(null);

    const previous = bookmarks;
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);
    if (error) {
      setBookmarks(previous);
      setErrorMessage(error.message);
    }
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Smart Bookmarks</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in with Google to create private bookmarks synced across tabs.
        </p>
        {errorMessage ? (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        <button
          onClick={handleGoogleAuth}
          className="mt-5 w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Continue with Google
        </button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Smart Bookmarks</h1>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
        >
          Log out
        </button>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <form onSubmit={handleAddBookmark} className="mt-6 grid gap-3 sm:grid-cols-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Bookmark title"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://example.com"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-sky-500 focus:ring-2"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="sm:col-span-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? "Adding..." : "Add bookmark"}
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {bookmarks.length === 0 ? (
          <li className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-500">
            No bookmarks yet.
          </li>
        ) : (
          bookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">{bookmark.title}</p>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate text-sm text-sky-700 hover:underline"
                >
                  {bookmark.url}
                </a>
              </div>
              <button
                onClick={() => handleDeleteBookmark(bookmark.id)}
                className="shrink-0 rounded-md border border-red-200 px-3 py-1 text-sm text-red-700 transition hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
