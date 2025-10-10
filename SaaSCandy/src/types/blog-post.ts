import { ReactNode } from 'react';

export interface HeadingContent {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
}

export interface ParagraphContent {
  text: string;
}

export interface ListContent {
  items: string[];
  ordered: boolean;
}

export interface QuoteContent {
  text: string;
  author?: string;
}

export interface ImageContent {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface CodeContent {
  code: string;
  language?: string;
}

export type ContentBlockData =
  | { type: 'heading'; content: HeadingContent }
  | { type: 'paragraph'; content: ParagraphContent }
  | { type: 'list'; content: ListContent }
  | { type: 'quote'; content: QuoteContent }
  | { type: 'image'; content: ImageContent }
  | { type: 'code'; content: CodeContent };

export type ContentBlock = ContentBlockData & {
  id: string;
};

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  image?: string;
  date: string;
  readTime?: string;
  tags?: string[];
  content?: string;
  author: {
    name: string;
    avatar?: string;
  };
  comments?: number;
  contentBlocks?: ContentBlock[];
  contentType: 'markdown' | 'structured';
}
