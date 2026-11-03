export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  firstPublishedDate?: string;
  lastPublishedDate?: string;
  coverMedia?: {
    image?: {
      url?: string;
      alt?: string;
    };
    enabled?: boolean;
  };
  author?: {
    name?: string;
  };
}
