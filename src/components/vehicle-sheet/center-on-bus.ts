const scrollToBus = (root: ParentNode): void => {
  const bus = root.querySelector<HTMLElement>('.diag-bus');
  const box = root.querySelector<HTMLElement>('.diagram');
  [{ bus, box }]
    .filter(
      (pair): pair is { bus: HTMLElement; box: HTMLElement } =>
        pair.bus !== null && pair.box !== null,
    )
    .forEach(({ bus: marker, box: viewport }) => {
      viewport.scrollLeft = marker.offsetLeft - viewport.clientWidth / 2;
    });
};

/**
 * On each collapse, scroll the line diagram so the vehicle marker lands
 * in the middle of the visible rail — the user opens looking at where
 * the bus actually is. Returns the next "already centered for" key so
 * the 10 s refresh does not fight a manual scroll. Expanding clears it.
 */
export const maybeCenter = (
  root: ParentNode,
  collapsed: boolean,
  targetId: string | undefined,
  centeredFor: string | undefined,
): string | undefined =>
  [collapsed && targetId !== undefined && targetId !== centeredFor]
    .filter((due) => due)
    .map(() => {
      scrollToBus(root);
      return targetId;
    })[0] ?? { true: centeredFor, false: undefined }[`${collapsed}`];
