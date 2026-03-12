export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  category: 'AI' | 'Marketing' | 'Tech' | 'Business';
  imageUrl?: string;
}
