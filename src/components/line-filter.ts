import { LitElement, type TemplateResult } from 'lit';
import { state } from 'lit/decorators.js';
import { loadLines } from '../lib/data/load-lines.ts';
import { toggleSelection } from '../lib/lines/toggle-selection.ts';
import type { UiLine } from '../lib/lines/ui-line.ts';
import { appState } from '../lib/store/app-state.ts';
import { applySelectionChange } from './line-filter/apply-selection-change.ts';
import { renderRoot } from './line-filter/render-root.ts';

/** FAB + dock to filter the network by lines (live-map US-2). */
export class LineFilter extends LitElement {
  @state() declare open: boolean;
  @state() declare query: string;
  @state() declare lines: readonly UiLine[];
  @state() declare selected: ReadonlySet<string>;

  constructor() {
    super();
    this.open = false;
    this.query = '';
    this.lines = [];
    this.selected = new Set();
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    appState.selectedLines.subscribe((keys) => {
      this.selected = keys;
    });
    void loadLines().then((lines) => {
      this.lines = lines;
    });
  }

  private readonly onToggle = (key: string): void =>
    applySelectionChange(this.lines, toggleSelection(this.selected, key));

  protected override render(): TemplateResult {
    return renderRoot(
      this,
      () => {
        this.open = !this.open;
      },
      {
        onQuery: (query) => {
          this.query = query;
        },
        onToggle: this.onToggle,
        onClear: () => applySelectionChange(this.lines, new Set()),
      },
    );
  }
}

customElements.define('line-filter', LineFilter);
