export type AppUser = {
  id: string;
  email: string | null;
};

export type Bookmark = {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
};
