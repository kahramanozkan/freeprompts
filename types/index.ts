export interface Prompt {
  id: string;
  title: string;
  content: string;
  image: string;
  tags: string[];
  list: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: string;
  likes: number;
  views: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface PromptList {
  id: string;
  name: string;
  description: string;
  promptIds: string[];
  createdAt: string;
}

export interface List {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  userId: string;
  userName: string;
  createdAt: string;
  promptCount: number;
  likes: number;
  views: number;
}