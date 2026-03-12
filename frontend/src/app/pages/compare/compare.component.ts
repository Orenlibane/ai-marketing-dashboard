import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';
import { MarketingTool } from '../../models/marketing-tool.model';
import { environment } from '../../../environments/environment';

interface ToolAnalysis {
  toolId: number;
  toolName: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

interface ComparisonResult {
  overview: string;
  toolAnalysis: ToolAnalysis[];
  recommendation: string;
}

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="compare-page">
      <!-- Header -->
      <header class="page-header">
        <h1 class="page-title">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          AI Tool Comparison
        </h1>
        <p class="page-subtitle">Compare up to 3 marketing AI tools side by side</p>
      </header>

      <!-- Tool Selection -->
      <section class="selection-section glass-card">
        <h2 class="section-title">Select Tools to Compare</h2>
        <div class="tool-selector">
          <div class="selected-tools">
            @for (tool of selectedTools(); track tool.id) {
              <div class="selected-chip">
                <span>{{ tool.name }}</span>
                <button class="remove-btn" (click)="removeTool(tool)">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            }
            @if (selectedTools().length < 3) {
              <div class="add-tool-dropdown">
                <button class="add-btn" (click)="toggleDropdown()">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Tool
                </button>
                @if (showDropdown()) {
                  <div class="dropdown-menu">
                    <input
                      type="text"
                      class="search-input"
                      placeholder="Search tools..."
                      [(ngModel)]="searchQuery"
                      (input)="onSearchChange()"
                    />
                    <div class="dropdown-list">
                      @for (tool of filteredTools(); track tool.id) {
                        <button class="dropdown-item" (click)="selectTool(tool)">
                          <span class="tool-icon">{{ getCategoryIcon(tool.category) }}</span>
                          <div class="tool-info">
                            <span class="tool-name">{{ tool.name }}</span>
                            <span class="tool-category">{{ tool.category }}</span>
                          </div>
                          <span class="tool-score" [class]="getScoreClass(tool.usageScore)">{{ tool.usageScore }}</span>
                        </button>
                      }
                      @if (filteredTools().length === 0) {
                        <div class="no-results">No tools found</div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
          @if (selectedTools().length >= 2) {
            <button class="compare-btn" (click)="runComparison()" [disabled]="isLoading()">
              @if (isLoading()) {
                <span class="spinner"></span>
                Analyzing...
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Run AI Comparison
              }
            </button>
          }
        </div>
      </section>

      @if (selectedTools().length >= 2) {
        <!-- Comparison Cards -->
        <section class="comparison-section">
          <div class="comparison-grid" [style.gridTemplateColumns]="'repeat(' + selectedTools().length + ', 1fr)'">
            @for (tool of selectedTools(); track tool.id) {
              <div class="tool-comparison-card glass-card">
                <div class="card-header">
                  <div class="tool-icon-lg" [class]="getCategoryColorClass(tool.category)">
                    {{ getCategoryIcon(tool.category) }}
                  </div>
                  <h3 class="tool-name">{{ tool.name }}</h3>
                  <span class="tool-badge">{{ tool.category }}</span>
                </div>
                <div class="card-metrics">
                  <div class="metric">
                    <span class="metric-label">Score</span>
                    <span class="metric-value" [class]="getScoreClass(tool.usageScore)">{{ tool.usageScore }}</span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Sentiment</span>
                    <span class="sentiment-indicator" [class]="tool.reviewSentiment">
                      {{ tool.reviewSentiment }}
                    </span>
                  </div>
                  <div class="metric">
                    <span class="metric-label">Status</span>
                    <span class="status-badge" [class.new]="tool.isNewLaunch">
                      {{ tool.isNewLaunch ? 'New' : 'Established' }}
                    </span>
                  </div>
                </div>
                <p class="card-description">{{ tool.description }}</p>
                <a [href]="tool.sourceUrl" target="_blank" rel="noopener" class="source-link">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit Website
                </a>
              </div>
            }
          </div>
        </section>

        <!-- Radar Chart Comparison -->
        <section class="chart-section glass-card">
          <h2 class="section-title">Performance Comparison</h2>
          <div class="radar-container">
            <svg viewBox="0 0 400 400" class="radar-svg">
              <defs>
                @for (tool of selectedTools(); track tool.id; let i = $index) {
                  <linearGradient [id]="'toolGradient' + i" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" [attr.style]="'stop-color: ' + getToolColor(i, 0.6)" />
                    <stop offset="100%" [attr.style]="'stop-color: ' + getToolColor(i, 0.2)" />
                  </linearGradient>
                }
              </defs>

              <!-- Grid -->
              @for (level of [0.2, 0.4, 0.6, 0.8, 1]; track level) {
                <polygon
                  [attr.points]="getGridPoints(level)"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  stroke-width="1"
                />
              }

              <!-- Axes -->
              @for (axis of radarAxes; track axis.label; let i = $index) {
                <line
                  [attr.x1]="200"
                  [attr.y1]="200"
                  [attr.x2]="200 + 140 * Math.cos(getAxisAngle(i))"
                  [attr.y2]="200 + 140 * Math.sin(getAxisAngle(i))"
                  stroke="rgba(255, 255, 255, 0.1)"
                  stroke-width="1"
                />
                <text
                  [attr.x]="200 + 170 * Math.cos(getAxisAngle(i))"
                  [attr.y]="200 + 170 * Math.sin(getAxisAngle(i))"
                  fill="rgba(255, 255, 255, 0.6)"
                  font-size="12"
                  text-anchor="middle"
                  dominant-baseline="middle"
                >
                  {{ axis.label }}
                </text>
              }

              <!-- Tool Areas -->
              @for (tool of selectedTools(); track tool.id; let i = $index) {
                <polygon
                  [attr.points]="getToolPolygonPoints(tool, i)"
                  [attr.fill]="'url(#toolGradient' + i + ')'"
                  [attr.stroke]="getToolColor(i, 1)"
                  stroke-width="2"
                  fill-opacity="0.3"
                />
              }

              <!-- Data Points -->
              @for (tool of selectedTools(); track tool.id; let toolIdx = $index) {
                @for (axis of radarAxes; track axis.label; let axisIdx = $index) {
                  <circle
                    [attr.cx]="getDataPointX(tool, axisIdx)"
                    [attr.cy]="getDataPointY(tool, axisIdx)"
                    r="5"
                    [attr.fill]="getToolColor(toolIdx, 1)"
                    stroke="#0F172A"
                    stroke-width="2"
                  />
                }
              }
            </svg>

            <!-- Legend -->
            <div class="radar-legend">
              @for (tool of selectedTools(); track tool.id; let i = $index) {
                <div class="legend-item">
                  <span class="legend-color" [style.backgroundColor]="getToolColor(i, 1)"></span>
                  <span class="legend-name">{{ tool.name }}</span>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Feature Comparison Table -->
        <section class="table-section glass-card">
          <h2 class="section-title">Feature Comparison</h2>
          <div class="table-wrapper">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  @for (tool of selectedTools(); track tool.id) {
                    <th>{{ tool.name }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Usage Score</td>
                  @for (tool of selectedTools(); track tool.id) {
                    <td>
                      <span class="score-cell" [class]="getScoreClass(tool.usageScore)">{{ tool.usageScore }}/100</span>
                    </td>
                  }
                </tr>
                <tr>
                  <td>Category</td>
                  @for (tool of selectedTools(); track tool.id) {
                    <td>{{ tool.category }}</td>
                  }
                </tr>
                <tr>
                  <td>User Sentiment</td>
                  @for (tool of selectedTools(); track tool.id) {
                    <td>
                      <span class="sentiment-cell" [class]="tool.reviewSentiment">
                        @if (tool.reviewSentiment === 'positive') { Positive }
                        @else if (tool.reviewSentiment === 'neutral') { Neutral }
                        @else { Negative }
                      </span>
                    </td>
                  }
                </tr>
                <tr>
                  <td>Launch Status</td>
                  @for (tool of selectedTools(); track tool.id) {
                    <td>{{ tool.isNewLaunch ? 'Recently Launched' : 'Established' }}</td>
                  }
                </tr>
                <tr>
                  <td>Last Updated</td>
                  @for (tool of selectedTools(); track tool.id) {
                    <td>{{ formatDate(tool.lastUpdated) }}</td>
                  }
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- AI Analysis Section -->
        @if (comparisonResult()) {
          <section class="analysis-section glass-card">
            <h2 class="section-title">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Analysis
            </h2>

            <!-- Overview -->
            <div class="analysis-overview">
              <p>{{ comparisonResult()?.overview }}</p>
            </div>

            <!-- Tool Pros & Cons -->
            <div class="pros-cons-grid">
              @for (analysis of comparisonResult()?.toolAnalysis; track analysis.toolId) {
                <div class="pros-cons-card">
                  <h3 class="tool-title">{{ analysis.toolName }}</h3>

                  <div class="pros-section">
                    <h4 class="section-label positive">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Pros
                    </h4>
                    <ul>
                      @for (pro of analysis.pros; track pro) {
                        <li>{{ pro }}</li>
                      }
                    </ul>
                  </div>

                  <div class="cons-section">
                    <h4 class="section-label negative">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cons
                    </h4>
                    <ul>
                      @for (con of analysis.cons; track con) {
                        <li>{{ con }}</li>
                      }
                    </ul>
                  </div>

                  <div class="best-for">
                    <span class="label">Best For:</span>
                    <span class="value">{{ analysis.bestFor }}</span>
                  </div>
                </div>
              }
            </div>

            <!-- Recommendation -->
            <div class="recommendation">
              <h4>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Recommendation
              </h4>
              <p>{{ comparisonResult()?.recommendation }}</p>
            </div>
          </section>
        }
      } @else {
        <!-- Empty State -->
        <div class="empty-state glass-card">
          <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <h3>Select at least 2 tools to compare</h3>
          <p>Choose from your available marketing AI tools to see a detailed side-by-side comparison with AI-powered insights.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .compare-page {
      min-height: 100vh;
      background: linear-gradient(180deg, #0F172A 0%, #1E293B 100%);
      padding: 24px;
      padding-bottom: 100px;
    }

    .page-header {
      margin-bottom: 24px;
    }

    .page-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
    }

    .page-title svg {
      color: #A855F7;
    }

    .page-subtitle {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 20px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 18px;
      font-weight: 600;
      color: white;
      margin-bottom: 20px;
    }

    .section-title svg {
      color: #A855F7;
    }

    /* Tool Selection */
    .tool-selector {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .selected-tools {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      flex: 1;
    }

    .selected-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2));
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 12px;
      color: white;
      font-size: 14px;
      font-weight: 500;
    }

    .remove-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(239, 68, 68, 0.2);
      border: none;
      border-radius: 6px;
      color: #EF4444;
      padding: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.4);
    }

    .add-tool-dropdown {
      position: relative;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(168, 85, 247, 0.5);
      color: white;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      min-width: 300px;
      max-width: 350px;
      background: rgba(15, 23, 42, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 12px;
      z-index: 50;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }

    .search-input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: white;
      font-size: 14px;
      margin-bottom: 10px;
    }

    .search-input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .search-input:focus {
      outline: none;
      border-color: rgba(168, 85, 247, 0.5);
    }

    .dropdown-list {
      max-height: 250px;
      overflow-y: auto;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 10px 12px;
      background: transparent;
      border: none;
      border-radius: 10px;
      color: white;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
    }

    .dropdown-item:hover {
      background: rgba(168, 85, 247, 0.15);
    }

    .tool-icon {
      font-size: 20px;
    }

    .tool-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .tool-name {
      font-weight: 500;
      font-size: 14px;
    }

    .tool-category {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    .tool-score {
      font-weight: 700;
      font-size: 14px;
      padding: 4px 8px;
      border-radius: 8px;
    }

    .tool-score.high { background: rgba(16, 185, 129, 0.2); color: #10B981; }
    .tool-score.medium { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
    .tool-score.low { background: rgba(239, 68, 68, 0.2); color: #EF4444; }

    .no-results {
      padding: 16px;
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
    }

    .compare-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #A855F7, #3B82F6);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 8px 20px -6px rgba(168, 85, 247, 0.5);
    }

    .compare-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px -6px rgba(168, 85, 247, 0.6);
    }

    .compare-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Comparison Grid */
    .comparison-grid {
      display: grid;
      gap: 16px;
    }

    .tool-comparison-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-header {
      text-align: center;
    }

    .tool-icon-lg {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      margin: 0 auto 12px;
    }

    .tool-icon-lg.purple { background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.2)); }
    .tool-icon-lg.blue { background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2)); }
    .tool-icon-lg.pink { background: linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2)); }
    .tool-icon-lg.cyan { background: linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(8, 145, 178, 0.2)); }
    .tool-icon-lg.amber { background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.2)); }
    .tool-icon-lg.orange { background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2)); }

    .card-header .tool-name {
      font-size: 18px;
      font-weight: 600;
      color: white;
      margin-bottom: 8px;
    }

    .tool-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(168, 85, 247, 0.15);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 20px;
      color: #A855F7;
      font-size: 12px;
      font-weight: 500;
    }

    .card-metrics {
      display: flex;
      justify-content: center;
      gap: 20px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
    }

    .metric {
      text-align: center;
    }

    .metric-label {
      display: block;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .metric-value {
      font-size: 20px;
      font-weight: 700;
    }

    .metric-value.high { color: #10B981; }
    .metric-value.medium { color: #F59E0B; }
    .metric-value.low { color: #EF4444; }

    .sentiment-indicator {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .sentiment-indicator.positive { background: rgba(16, 185, 129, 0.2); color: #10B981; }
    .sentiment-indicator.neutral { background: rgba(245, 158, 11, 0.2); color: #F59E0B; }
    .sentiment-indicator.negative { background: rgba(239, 68, 68, 0.2); color: #EF4444; }

    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(100, 116, 139, 0.2);
      color: rgba(255, 255, 255, 0.6);
    }

    .status-badge.new {
      background: rgba(16, 185, 129, 0.2);
      color: #10B981;
    }

    .card-description {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
      line-height: 1.6;
      text-align: center;
    }

    .source-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .source-link:hover {
      background: rgba(168, 85, 247, 0.15);
      border-color: rgba(168, 85, 247, 0.3);
      color: white;
    }

    /* Radar Chart */
    .radar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    .radar-svg {
      width: 100%;
      max-width: 400px;
      height: auto;
    }

    .radar-legend {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 20px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .legend-name {
      color: rgba(255, 255, 255, 0.7);
      font-size: 13px;
    }

    /* Comparison Table */
    .table-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .comparison-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 400px;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .comparison-table th {
      background: rgba(168, 85, 247, 0.1);
      color: white;
      font-weight: 600;
      font-size: 13px;
    }

    .comparison-table th:first-child {
      border-radius: 10px 0 0 0;
    }

    .comparison-table th:last-child {
      border-radius: 0 10px 0 0;
    }

    .comparison-table td {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }

    .comparison-table td:first-child {
      color: rgba(255, 255, 255, 0.5);
      font-weight: 500;
    }

    .comparison-table tr:last-child td:first-child {
      border-radius: 0 0 0 10px;
    }

    .comparison-table tr:last-child td:last-child {
      border-radius: 0 0 10px 0;
    }

    .score-cell {
      font-weight: 600;
    }

    .score-cell.high { color: #10B981; }
    .score-cell.medium { color: #F59E0B; }
    .score-cell.low { color: #EF4444; }

    .sentiment-cell {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }

    .sentiment-cell.positive { background: rgba(16, 185, 129, 0.15); color: #10B981; }
    .sentiment-cell.neutral { background: rgba(245, 158, 11, 0.15); color: #F59E0B; }
    .sentiment-cell.negative { background: rgba(239, 68, 68, 0.15); color: #EF4444; }

    /* AI Analysis Section */
    .analysis-overview {
      padding: 20px;
      background: rgba(168, 85, 247, 0.08);
      border: 1px solid rgba(168, 85, 247, 0.2);
      border-radius: 14px;
      margin-bottom: 24px;
    }

    .analysis-overview p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 15px;
      line-height: 1.7;
    }

    .pros-cons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .pros-cons-card {
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px;
    }

    .pros-cons-card .tool-title {
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .pros-section, .cons-section {
      margin-bottom: 16px;
    }

    .section-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-label.positive { color: #10B981; }
    .section-label.negative { color: #EF4444; }

    .pros-section ul, .cons-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .pros-section li, .cons-section li {
      position: relative;
      padding-left: 16px;
      margin-bottom: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      line-height: 1.5;
    }

    .pros-section li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      background: #10B981;
      border-radius: 50%;
    }

    .cons-section li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      background: #EF4444;
      border-radius: 50%;
    }

    .best-for {
      padding: 12px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 10px;
    }

    .best-for .label {
      display: block;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .best-for .value {
      color: #60A5FA;
      font-size: 14px;
      font-weight: 500;
    }

    .recommendation {
      padding: 20px;
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(59, 130, 246, 0.12));
      border: 1px solid rgba(168, 85, 247, 0.25);
      border-radius: 14px;
    }

    .recommendation h4 {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #A855F7;
      margin-bottom: 12px;
    }

    .recommendation p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 15px;
      line-height: 1.7;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 60px 24px;
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      color: rgba(168, 85, 247, 0.4);
      margin-bottom: 24px;
    }

    .empty-state h3 {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin-bottom: 12px;
    }

    .empty-state p {
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      max-width: 400px;
      margin: 0 auto;
      line-height: 1.6;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .compare-page {
        padding: 16px;
        padding-bottom: 100px;
      }

      .page-title {
        font-size: 22px;
      }

      .page-title svg {
        width: 28px;
        height: 28px;
      }

      .glass-card {
        padding: 16px;
        border-radius: 16px;
      }

      .comparison-grid {
        grid-template-columns: 1fr !important;
      }

      .tool-selector {
        flex-direction: column;
        align-items: stretch;
      }

      .compare-btn {
        width: 100%;
        justify-content: center;
      }

      .dropdown-menu {
        min-width: 100%;
        max-width: 100%;
        left: 50%;
        transform: translateX(-50%);
      }

      .card-metrics {
        flex-wrap: wrap;
        gap: 12px;
      }

      .radar-svg {
        max-width: 300px;
      }

      .radar-legend {
        gap: 12px;
      }

      .pros-cons-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 18px;
      }

      .section-title {
        font-size: 16px;
      }

      .selected-chip {
        padding: 6px 10px;
        font-size: 12px;
      }

      .add-btn {
        padding: 8px 14px;
        font-size: 13px;
      }

      .tool-icon-lg {
        width: 52px;
        height: 52px;
        font-size: 24px;
      }

      .card-header .tool-name {
        font-size: 16px;
      }

      .card-metrics {
        padding: 12px;
      }

      .metric-value {
        font-size: 16px;
      }

      .comparison-table th,
      .comparison-table td {
        padding: 10px 12px;
        font-size: 12px;
      }

      .analysis-overview p,
      .recommendation p {
        font-size: 14px;
      }

      .pros-cons-card {
        padding: 16px;
      }

      .empty-icon {
        width: 60px;
        height: 60px;
      }

      .empty-state h3 {
        font-size: 18px;
      }
    }
  `]
})
export class CompareComponent implements OnInit {
  private toolsService = inject(ToolsService);
  private http = inject(HttpClient);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] as MarketingTool[] });
  selectedTools = signal<MarketingTool[]>([]);
  showDropdown = signal(false);
  searchQuery = '';
  isLoading = signal(false);
  comparisonResult = signal<ComparisonResult | null>(null);

  Math = Math;

  radarAxes = [
    { label: 'Score', key: 'usageScore' },
    { label: 'Freshness', key: 'freshness' },
    { label: 'Sentiment', key: 'sentiment' },
    { label: 'Popularity', key: 'popularity' },
    { label: 'Reliability', key: 'reliability' },
    { label: 'Innovation', key: 'innovation' }
  ];

  toolColors = [
    '#A855F7', // Purple
    '#3B82F6', // Blue
    '#10B981'  // Green
  ];

  ngOnInit() {
    this.toolsService.loadTools();
  }

  filteredTools = computed(() => {
    const allTools = this.tools();
    const selected = this.selectedTools();
    const query = this.searchQuery.toLowerCase();

    return allTools
      .filter(tool => !selected.some(s => s.id === tool.id))
      .filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
      );
  });

  toggleDropdown() {
    this.showDropdown.update(v => !v);
  }

  selectTool(tool: MarketingTool) {
    if (this.selectedTools().length < 3) {
      this.selectedTools.update(tools => [...tools, tool]);
      this.comparisonResult.set(null);
    }
    this.showDropdown.set(false);
    this.searchQuery = '';
  }

  removeTool(tool: MarketingTool) {
    this.selectedTools.update(tools => tools.filter(t => t.id !== tool.id));
    this.comparisonResult.set(null);
  }

  onSearchChange() {
    // Triggers computed recalculation
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'SEO': '🔍',
      'Content': '✍️',
      'Social': '📱',
      'Analytics': '📊',
      'Email': '📧',
      'Ads': '📢',
      'Video': '🎬',
      'Design': '🎨'
    };
    return icons[category] || '🔧';
  }

  getCategoryColorClass(category: string): string {
    const colors: Record<string, string> = {
      'SEO': 'blue',
      'Content': 'purple',
      'Social': 'pink',
      'Analytics': 'cyan',
      'Email': 'amber',
      'Ads': 'orange',
      'Video': 'pink',
      'Design': 'purple'
    };
    return colors[category] || 'blue';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }

  getToolColor(index: number, opacity: number): string {
    const color = this.toolColors[index] || this.toolColors[0];
    if (opacity === 1) return color;

    // Convert hex to rgba
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  getAxisAngle(index: number): number {
    return (Math.PI * 2 * index) / this.radarAxes.length - Math.PI / 2;
  }

  getGridPoints(level: number): string {
    const points: string[] = [];
    for (let i = 0; i < this.radarAxes.length; i++) {
      const angle = this.getAxisAngle(i);
      const x = 200 + 140 * level * Math.cos(angle);
      const y = 200 + 140 * level * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }

  getToolValue(tool: MarketingTool, axisIndex: number): number {
    const axis = this.radarAxes[axisIndex];
    switch (axis.key) {
      case 'usageScore':
        return tool.usageScore;
      case 'sentiment':
        return tool.reviewSentiment === 'positive' ? 90 : tool.reviewSentiment === 'neutral' ? 60 : 30;
      case 'freshness':
        return tool.isNewLaunch ? 95 : 60;
      case 'popularity':
        return Math.min(100, tool.usageScore + Math.random() * 15);
      case 'reliability':
        return tool.reviewSentiment === 'positive' ? 85 : 65;
      case 'innovation':
        return tool.isNewLaunch ? 90 : 70;
      default:
        return 50;
    }
  }

  getToolPolygonPoints(tool: MarketingTool, toolIndex: number): string {
    const points: string[] = [];
    for (let i = 0; i < this.radarAxes.length; i++) {
      const angle = this.getAxisAngle(i);
      const value = this.getToolValue(tool, i) / 100;
      const x = 200 + 140 * value * Math.cos(angle);
      const y = 200 + 140 * value * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }

  getDataPointX(tool: MarketingTool, axisIndex: number): number {
    const angle = this.getAxisAngle(axisIndex);
    const value = this.getToolValue(tool, axisIndex) / 100;
    return 200 + 140 * value * Math.cos(angle);
  }

  getDataPointY(tool: MarketingTool, axisIndex: number): number {
    const angle = this.getAxisAngle(axisIndex);
    const value = this.getToolValue(tool, axisIndex) / 100;
    return 200 + 140 * value * Math.sin(angle);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  runComparison() {
    const tools = this.selectedTools();
    if (tools.length < 2) return;

    this.isLoading.set(true);

    this.http.post<{ success: boolean; comparison: ComparisonResult }>(
      `${environment.apiUrl}/api/tools/compare`,
      { toolIds: tools.map(t => t.id) }
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.comparisonResult.set(response.comparison);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Comparison error:', err);
        this.isLoading.set(false);
        // Generate fallback comparison
        this.generateFallbackComparison(tools);
      }
    });
  }

  private generateFallbackComparison(tools: MarketingTool[]) {
    const toolAnalysis: ToolAnalysis[] = tools.map(tool => ({
      toolId: tool.id,
      toolName: tool.name,
      pros: [
        `Strong ${tool.category} capabilities`,
        tool.usageScore >= 80 ? 'High user satisfaction score' : 'Growing user base',
        tool.isNewLaunch ? 'Latest features and updates' : 'Proven track record'
      ],
      cons: [
        tool.usageScore < 80 ? 'Room for improvement in user experience' : 'Premium pricing may be a barrier',
        tool.isNewLaunch ? 'Limited long-term track record' : 'May lack cutting-edge features',
        'Learning curve for new users'
      ],
      bestFor: tool.isNewLaunch
        ? `Teams seeking cutting-edge ${tool.category} solutions`
        : `Organizations prioritizing stability in ${tool.category}`
    }));

    const highestScore = tools.reduce((a, b) => a.usageScore > b.usageScore ? a : b);

    this.comparisonResult.set({
      overview: `This comparison analyzes ${tools.length} marketing AI tools across key metrics. Each tool has unique strengths suited for different use cases and team sizes.`,
      toolAnalysis,
      recommendation: `Based on overall scores and user sentiment, ${highestScore.name} shows the strongest performance with a usage score of ${highestScore.usageScore}. However, the best choice depends on your specific ${tools[0].category} needs and budget constraints.`
    });
  }
}
