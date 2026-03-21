export interface User {
  username: string;
  email: string;
  password: string;
  token?: string;
}

export interface Article {
  title: string;
  description: string;
  body: string;
  tagList: string[];
  slug?: string;
}
