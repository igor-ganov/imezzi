/** data-testid contract shared by the sheet and E2E specs. */
export const STOP_SHEET_LOCATORS: Readonly<
  Record<'sheet' | 'title' | 'row' | 'close' | 'note' | 'route', string>
> = {
  sheet: 'stop-sheet',
  title: 'stop-sheet-title',
  row: 'board-row',
  close: 'stop-sheet-close',
  note: 'stop-sheet-note',
  route: 'stop-sheet-route',
};
