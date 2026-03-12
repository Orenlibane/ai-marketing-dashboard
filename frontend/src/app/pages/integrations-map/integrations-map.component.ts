import { Component, OnInit, inject, signal, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToolsService } from '../../services/tools.service';
import { MarketingTool } from '../../models/marketing-tool.model';

interface Integration {
  from: string;
  to: string;
  type: 'native' | 'zapier' | 'api' | 'webhook';
}

interface GraphNode {
  id: string;
  name: string;
  category: string;
  x: number;
  y: number;
  connections: number;
}

@Component({
  selector: 'app-integrations-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="integrations-page">
      <!-- Header -->
      <header class="page-header">
        <h1 class="page-title">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Integration Map
        </h1>
        <p class="page-subtitle">Visualize how your marketing tools connect with each other</p>
      </header>

      <!-- Controls -->
      <section class="controls-section glass-card">
        <div class="controls-row">
          <!-- Filter by Category -->
          <div class="filter-group">
            <label>Filter by Category</label>
            <select [(ngModel)]="selectedCategory" (change)="filterNodes()">
              <option value="all">All Categories</option>
              @for (cat of categories; track cat) {
                <option [value]="cat">{{ cat }}</option>
              }
            </select>
          </div>

          <!-- Filter by Integration Type -->
          <div class="filter-group">
            <label>Integration Type</label>
            <div class="type-filters">
              @for (type of integrationTypes; track type.value) {
                <button
                  class="type-btn"
                  [class.active]="selectedTypes().includes(type.value)"
                  (click)="toggleType(type.value)"
                >
                  <span class="type-dot" [style.backgroundColor]="type.color"></span>
                  {{ type.label }}
                </button>
              }
            </div>
          </div>

          <!-- Search -->
          <div class="filter-group search-group">
            <label>Search Tool</label>
            <input
              type="text"
              placeholder="Search..."
              [(ngModel)]="searchQuery"
              (input)="filterNodes()"
            />
          </div>
        </div>

        <!-- Legend -->
        <div class="legend">
          <span class="legend-title">Connection Types:</span>
          @for (type of integrationTypes; track type.value) {
            <div class="legend-item">
              <span class="legend-line" [style.backgroundColor]="type.color"></span>
              {{ type.label }}
            </div>
          }
        </div>
      </section>

      <!-- Graph Container -->
      <section class="graph-section glass-card">
        <div class="graph-container" #graphContainer>
          <svg
            [attr.viewBox]="'0 0 ' + graphWidth + ' ' + graphHeight"
            class="graph-svg"
            (click)="clearSelection($event)"
          >
            <defs>
              <!-- Gradient definitions for connections -->
              <linearGradient id="nativeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #10B981" />
                <stop offset="100%" style="stop-color: #059669" />
              </linearGradient>
              <linearGradient id="zapierGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #FF4A00" />
                <stop offset="100%" style="stop-color: #FF6B35" />
              </linearGradient>
              <linearGradient id="apiGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #3B82F6" />
                <stop offset="100%" style="stop-color: #60A5FA" />
              </linearGradient>
              <linearGradient id="webhookGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color: #A855F7" />
                <stop offset="100%" style="stop-color: #C084FC" />
              </linearGradient>

              <!-- Glow filter -->
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- Connections -->
            @for (conn of visibleConnections(); track conn.from + conn.to) {
              <line
                [attr.x1]="getNodeX(conn.from)"
                [attr.y1]="getNodeY(conn.from)"
                [attr.x2]="getNodeX(conn.to)"
                [attr.y2]="getNodeY(conn.to)"
                [attr.stroke]="getConnectionColor(conn.type)"
                [attr.stroke-width]="isConnectionHighlighted(conn) ? 3 : 1.5"
                [attr.opacity]="getConnectionOpacity(conn)"
                class="connection-line"
              />
            }

            <!-- Nodes -->
            @for (node of visibleNodes(); track node.id) {
              <g
                class="node-group"
                [class.selected]="selectedNode() === node.id"
                [class.dimmed]="selectedNode() && selectedNode() !== node.id && !isConnectedToSelected(node.id)"
                (click)="selectNode(node.id, $event)"
              >
                <!-- Node circle -->
                <circle
                  [attr.cx]="node.x"
                  [attr.cy]="node.y"
                  [attr.r]="getNodeRadius(node)"
                  [attr.fill]="getCategoryColor(node.category)"
                  class="node-circle"
                  [attr.filter]="selectedNode() === node.id ? 'url(#glow)' : ''"
                />

                <!-- Connection count badge -->
                @if (node.connections > 0) {
                  <circle
                    [attr.cx]="node.x + 18"
                    [attr.cy]="node.y - 18"
                    r="10"
                    fill="#A855F7"
                    class="badge-circle"
                  />
                  <text
                    [attr.x]="node.x + 18"
                    [attr.y]="node.y - 14"
                    class="badge-text"
                  >
                    {{ node.connections }}
                  </text>
                }

                <!-- Node icon -->
                <text
                  [attr.x]="node.x"
                  [attr.y]="node.y + 5"
                  class="node-icon"
                >
                  {{ getCategoryIcon(node.category) }}
                </text>

                <!-- Node label -->
                <text
                  [attr.x]="node.x"
                  [attr.y]="node.y + 38"
                  class="node-label"
                >
                  {{ node.name }}
                </text>
              </g>
            }
          </svg>
        </div>

        <!-- Selected Tool Info -->
        @if (selectedNode()) {
          <div class="selected-info">
            <div class="info-header">
              <span class="info-icon">{{ getCategoryIcon(getSelectedNodeData()?.category || '') }}</span>
              <div>
                <h3>{{ getSelectedNodeData()?.name }}</h3>
                <span class="info-category">{{ getSelectedNodeData()?.category }}</span>
              </div>
              <button class="close-btn" (click)="clearSelection($event)">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="connections-list">
              <h4>Integrates with ({{ getSelectedConnections().length }})</h4>
              @for (conn of getSelectedConnections(); track conn.to) {
                <div class="connection-item">
                  <span class="conn-dot" [style.backgroundColor]="getConnectionColor(conn.type)"></span>
                  <span class="conn-name">{{ conn.to === selectedNode() ? conn.from : conn.to }}</span>
                  <span class="conn-type">{{ conn.type }}</span>
                </div>
              }
              @if (getSelectedConnections().length === 0) {
                <p class="no-connections">No integrations found</p>
              }
            </div>
          </div>
        }
      </section>

      <!-- Stats -->
      <section class="stats-section">
        <div class="stat-card glass-card">
          <div class="stat-value">{{ visibleNodes().length }}</div>
          <div class="stat-label">Tools</div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-value">{{ visibleConnections().length }}</div>
          <div class="stat-label">Integrations</div>
        </div>
        <div class="stat-card glass-card">
          <div class="stat-value">{{ getMostConnectedTool() }}</div>
          <div class="stat-label">Most Connected</div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .integrations-page {
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
      padding: 20px;
      margin-bottom: 20px;
    }

    /* Controls */
    .controls-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin-bottom: 16px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .filter-group label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-group select,
    .filter-group input {
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: white;
      font-size: 14px;
      min-width: 150px;
    }

    .filter-group select:focus,
    .filter-group input:focus {
      outline: none;
      border-color: rgba(168, 85, 247, 0.5);
    }

    .filter-group select option {
      background: #1E293B;
    }

    .search-group {
      flex: 1;
      min-width: 200px;
    }

    .search-group input {
      width: 100%;
    }

    .type-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .type-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .type-btn.active {
      background: rgba(168, 85, 247, 0.2);
      border-color: rgba(168, 85, 247, 0.4);
      color: white;
    }

    .type-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .legend {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      flex-wrap: wrap;
    }

    .legend-title {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.4);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    .legend-line {
      width: 20px;
      height: 3px;
      border-radius: 2px;
    }

    /* Graph */
    .graph-section {
      position: relative;
      padding: 0;
      overflow: hidden;
    }

    .graph-container {
      width: 100%;
      height: 500px;
      overflow: hidden;
    }

    .graph-svg {
      width: 100%;
      height: 100%;
    }

    .connection-line {
      transition: all 0.3s ease;
    }

    .node-group {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .node-group:hover .node-circle {
      filter: url(#glow);
    }

    .node-group.dimmed {
      opacity: 0.3;
    }

    .node-circle {
      transition: all 0.3s ease;
      stroke: rgba(255, 255, 255, 0.2);
      stroke-width: 2;
    }

    .node-group:hover .node-circle,
    .node-group.selected .node-circle {
      stroke: white;
      stroke-width: 3;
    }

    .node-icon {
      font-size: 20px;
      text-anchor: middle;
      pointer-events: none;
    }

    .node-label {
      font-size: 11px;
      fill: rgba(255, 255, 255, 0.8);
      text-anchor: middle;
      pointer-events: none;
    }

    .badge-circle {
      stroke: #0F172A;
      stroke-width: 2;
    }

    .badge-text {
      font-size: 10px;
      font-weight: 700;
      fill: white;
      text-anchor: middle;
      pointer-events: none;
    }

    /* Selected Info Panel */
    .selected-info {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 280px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-icon {
      font-size: 28px;
    }

    .info-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin: 0;
    }

    .info-category {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
    }

    .close-btn {
      margin-left: auto;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      padding: 6px;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #EF4444;
    }

    .connections-list h4 {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .connection-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .connection-item:last-child {
      border-bottom: none;
    }

    .conn-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .conn-name {
      flex: 1;
      font-size: 13px;
      color: white;
    }

    .conn-type {
      font-size: 10px;
      padding: 2px 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.6);
      text-transform: uppercase;
    }

    .no-connections {
      color: rgba(255, 255, 255, 0.4);
      font-size: 13px;
      text-align: center;
      padding: 20px 0;
    }

    /* Stats */
    .stats-section {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .stat-card {
      text-align: center;
      padding: 20px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Mobile */
    @media (max-width: 768px) {
      .integrations-page {
        padding: 16px;
        padding-bottom: 100px;
      }

      .page-title {
        font-size: 22px;
      }

      .controls-row {
        flex-direction: column;
        gap: 16px;
      }

      .type-filters {
        flex-wrap: wrap;
      }

      .graph-container {
        height: 400px;
      }

      .selected-info {
        position: fixed;
        top: auto;
        bottom: 80px;
        left: 16px;
        right: 16px;
        width: auto;
        z-index: 100;
      }

      .stats-section {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }

      .stat-card {
        padding: 16px 12px;
      }

      .stat-value {
        font-size: 22px;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 18px;
      }

      .legend {
        gap: 12px;
      }

      .graph-container {
        height: 350px;
      }

      .stat-value {
        font-size: 18px;
      }

      .stat-label {
        font-size: 10px;
      }
    }
  `]
})
export class IntegrationsMapComponent implements OnInit {
  private toolsService = inject(ToolsService);

  tools = toSignal(this.toolsService.tools$, { initialValue: [] as MarketingTool[] });

  graphWidth = 900;
  graphHeight = 500;

  selectedCategory = 'all';
  searchQuery = '';
  selectedNode = signal<string | null>(null);
  selectedTypes = signal<string[]>(['native', 'zapier', 'api', 'webhook']);

  categories = ['SEO', 'Content', 'Social', 'Analytics', 'Email', 'Ads', 'Video', 'Design'];

  integrationTypes = [
    { value: 'native', label: 'Native', color: '#10B981' },
    { value: 'zapier', label: 'Zapier', color: '#FF4A00' },
    { value: 'api', label: 'API', color: '#3B82F6' },
    { value: 'webhook', label: 'Webhook', color: '#A855F7' }
  ];

  // Sample integrations data
  integrations: Integration[] = [
    // Native integrations
    { from: 'Jasper', to: 'Surfer SEO', type: 'native' },
    { from: 'Jasper', to: 'Grammarly', type: 'native' },
    { from: 'Canva', to: 'Hootsuite', type: 'native' },
    { from: 'Canva', to: 'Buffer', type: 'native' },
    { from: 'Mailchimp', to: 'Canva', type: 'native' },
    { from: 'Mailchimp', to: 'Google Analytics 4', type: 'native' },
    { from: 'HubSpot', to: 'Mailchimp', type: 'native' },
    { from: 'Hootsuite', to: 'Google Analytics 4', type: 'native' },
    { from: 'Buffer', to: 'Canva', type: 'native' },
    { from: 'Klaviyo', to: 'Shopify', type: 'native' },

    // Zapier integrations
    { from: 'Jasper', to: 'Notion', type: 'zapier' },
    { from: 'Jasper', to: 'Google Docs', type: 'zapier' },
    { from: 'Copy.ai', to: 'Notion', type: 'zapier' },
    { from: 'Surfer SEO', to: 'Google Docs', type: 'zapier' },
    { from: 'Mailchimp', to: 'Slack', type: 'zapier' },
    { from: 'Hootsuite', to: 'Slack', type: 'zapier' },
    { from: 'Synthesia', to: 'YouTube', type: 'zapier' },
    { from: 'Canva', to: 'Dropbox', type: 'zapier' },

    // API integrations
    { from: 'Google Analytics 4', to: 'Mixpanel', type: 'api' },
    { from: 'Google Analytics 4', to: 'Amplitude', type: 'api' },
    { from: 'Mailchimp', to: 'Salesforce', type: 'api' },
    { from: 'HubSpot', to: 'Salesforce', type: 'api' },
    { from: 'Klaviyo', to: 'Segment', type: 'api' },
    { from: 'Mixpanel', to: 'Segment', type: 'api' },
    { from: 'Amplitude', to: 'Segment', type: 'api' },

    // Webhook integrations
    { from: 'Mailchimp', to: 'Custom CRM', type: 'webhook' },
    { from: 'Klaviyo', to: 'Custom Backend', type: 'webhook' },
    { from: 'Hootsuite', to: 'Analytics Dashboard', type: 'webhook' },
    { from: 'Buffer', to: 'Analytics Dashboard', type: 'webhook' }
  ];

  nodes = signal<GraphNode[]>([]);

  ngOnInit() {
    this.toolsService.loadTools();
    this.generateNodes();
  }

  generateNodes() {
    // Get unique tool names from integrations
    const toolNames = new Set<string>();
    this.integrations.forEach(i => {
      toolNames.add(i.from);
      toolNames.add(i.to);
    });

    // Create nodes in a circular layout
    const nodeArray: GraphNode[] = [];
    const centerX = this.graphWidth / 2;
    const centerY = this.graphHeight / 2;
    const radius = Math.min(centerX, centerY) - 80;

    let index = 0;
    const total = toolNames.size;

    toolNames.forEach(name => {
      const angle = (2 * Math.PI * index) / total - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      const connections = this.integrations.filter(
        i => i.from === name || i.to === name
      ).length;

      nodeArray.push({
        id: name,
        name: name,
        category: this.guessCategoryForTool(name),
        x,
        y,
        connections
      });

      index++;
    });

    this.nodes.set(nodeArray);
  }

  guessCategoryForTool(name: string): string {
    const categoryMap: Record<string, string> = {
      'Jasper': 'Content',
      'Copy.ai': 'Content',
      'Surfer SEO': 'SEO',
      'Grammarly': 'Content',
      'Canva': 'Design',
      'Hootsuite': 'Social',
      'Buffer': 'Social',
      'Mailchimp': 'Email',
      'Klaviyo': 'Email',
      'HubSpot': 'Email',
      'Google Analytics 4': 'Analytics',
      'Mixpanel': 'Analytics',
      'Amplitude': 'Analytics',
      'Segment': 'Analytics',
      'Synthesia': 'Video',
      'YouTube': 'Video',
      'Notion': 'Content',
      'Google Docs': 'Content',
      'Slack': 'Social',
      'Dropbox': 'Content',
      'Salesforce': 'Analytics',
      'Shopify': 'Ads',
      'Custom CRM': 'Analytics',
      'Custom Backend': 'Analytics',
      'Analytics Dashboard': 'Analytics'
    };
    return categoryMap[name] || 'Content';
  }

  visibleNodes = computed(() => {
    let filtered = this.nodes();

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(n => n.category === this.selectedCategory);
    }

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(n => n.name.toLowerCase().includes(query));
    }

    return filtered;
  });

  visibleConnections = computed(() => {
    const visibleNodeIds = new Set(this.visibleNodes().map(n => n.id));
    const types = this.selectedTypes();

    return this.integrations.filter(conn =>
      visibleNodeIds.has(conn.from) &&
      visibleNodeIds.has(conn.to) &&
      types.includes(conn.type)
    );
  });

  filterNodes() {
    // Triggers recomputation via signals
  }

  toggleType(type: string) {
    this.selectedTypes.update(types => {
      if (types.includes(type)) {
        return types.filter(t => t !== type);
      }
      return [...types, type];
    });
  }

  selectNode(id: string, event: Event) {
    event.stopPropagation();
    this.selectedNode.set(this.selectedNode() === id ? null : id);
  }

  clearSelection(event: Event) {
    if ((event.target as Element).classList.contains('graph-svg')) {
      this.selectedNode.set(null);
    }
  }

  getNodeX(name: string): number {
    const node = this.nodes().find(n => n.id === name);
    return node?.x || 0;
  }

  getNodeY(name: string): number {
    const node = this.nodes().find(n => n.id === name);
    return node?.y || 0;
  }

  getNodeRadius(node: GraphNode): number {
    const base = 24;
    const bonus = Math.min(node.connections * 2, 12);
    return base + bonus;
  }

  getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'SEO': '#3B82F6',
      'Content': '#A855F7',
      'Social': '#EC4899',
      'Analytics': '#06B6D4',
      'Email': '#F59E0B',
      'Ads': '#F97316',
      'Video': '#EC4899',
      'Design': '#8B5CF6'
    };
    return colors[category] || '#6B7280';
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

  getConnectionColor(type: string): string {
    const typeInfo = this.integrationTypes.find(t => t.value === type);
    return typeInfo?.color || '#6B7280';
  }

  getConnectionOpacity(conn: Integration): number {
    if (!this.selectedNode()) return 0.6;
    if (conn.from === this.selectedNode() || conn.to === this.selectedNode()) {
      return 1;
    }
    return 0.1;
  }

  isConnectionHighlighted(conn: Integration): boolean {
    return this.selectedNode() !== null &&
           (conn.from === this.selectedNode() || conn.to === this.selectedNode());
  }

  isConnectedToSelected(nodeId: string): boolean {
    const selected = this.selectedNode();
    if (!selected) return false;

    return this.integrations.some(
      conn => (conn.from === selected && conn.to === nodeId) ||
              (conn.to === selected && conn.from === nodeId)
    );
  }

  getSelectedNodeData(): GraphNode | undefined {
    return this.nodes().find(n => n.id === this.selectedNode());
  }

  getSelectedConnections(): Integration[] {
    const selected = this.selectedNode();
    if (!selected) return [];

    return this.integrations.filter(
      conn => conn.from === selected || conn.to === selected
    );
  }

  getMostConnectedTool(): string {
    const nodes = this.visibleNodes();
    if (nodes.length === 0) return '-';

    const most = nodes.reduce((a, b) => a.connections > b.connections ? a : b);
    return most.name;
  }
}
