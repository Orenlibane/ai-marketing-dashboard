import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MarketingTool, ToolStats, FetchToolsResponse } from '../models/marketing-tool.model';
import { NewsItem } from '../models/news.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private toolsSubject = new BehaviorSubject<MarketingTool[]>([]);
  private statsSubject = new BehaviorSubject<ToolStats | null>(null);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private newsSubject = new BehaviorSubject<NewsItem[]>([]);
  private newsLoadingSubject = new BehaviorSubject<boolean>(false);

  tools$ = this.toolsSubject.asObservable();
  stats$ = this.statsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  news$ = this.newsSubject.asObservable();
  newsLoading$ = this.newsLoadingSubject.asObservable();

  loadTools(): void {
    this.loadingSubject.next(true);
    this.http.get<MarketingTool[]>(`${this.apiUrl}/api/tools`).pipe(
      tap(tools => {
        this.toolsSubject.next(tools);
        this.loadingSubject.next(false);
      })
    ).subscribe({
      error: (err) => {
        console.error('Error loading tools:', err);
        this.loadingSubject.next(false);
      }
    });
  }

  loadStats(): void {
    this.http.get<ToolStats>(`${this.apiUrl}/api/stats`).pipe(
      tap(stats => this.statsSubject.next(stats))
    ).subscribe({
      error: (err) => console.error('Error loading stats:', err)
    });
  }

  fetchNewTools(): Observable<FetchToolsResponse> {
    this.loadingSubject.next(true);
    return this.http.post<FetchToolsResponse>(`${this.apiUrl}/api/fetch-tools`, {}).pipe(
      tap(() => {
        this.loadTools();
        this.loadStats();
      })
    );
  }

  loadNews(): void {
    this.newsLoadingSubject.next(true);
    this.http.get<NewsItem[]>(`${this.apiUrl}/api/news`).pipe(
      tap(news => {
        this.newsSubject.next(news);
        this.newsLoadingSubject.next(false);
      })
    ).subscribe({
      error: (err) => {
        console.error('Error loading news:', err);
        this.newsLoadingSubject.next(false);
      }
    });
  }

  refreshNews(): Observable<{ success: boolean; message: string; news: NewsItem[] }> {
    this.newsLoadingSubject.next(true);
    return this.http.post<{ success: boolean; message: string; news: NewsItem[] }>(`${this.apiUrl}/api/news/refresh`, {}).pipe(
      tap(response => {
        this.newsSubject.next(response.news);
        this.newsLoadingSubject.next(false);
      })
    );
  }

  getToolsByCategory(tools: MarketingTool[]): Map<string, MarketingTool[]> {
    const grouped = new Map<string, MarketingTool[]>();
    for (const tool of tools) {
      const existing = grouped.get(tool.category) || [];
      existing.push(tool);
      grouped.set(tool.category, existing);
    }
    return grouped;
  }

  // Generate share URL (read-only, no fetch capability)
  getShareUrl(): string {
    return `${window.location.origin}?view=shared`;
  }
}
