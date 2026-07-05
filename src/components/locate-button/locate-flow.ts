import { inMapArea } from '../../lib/map/in-map-area.ts';
import { appState } from '../../lib/store/app-state.ts';

export interface LocateHooks {
  readonly setBusy: (busy: boolean) => void;
  readonly setToast: (message: string) => void;
}

const MESSAGES: Readonly<Record<string, string>> = {
  outside: 'You are outside the map area (Genoa / Liguria).',
  denied: 'Location access is blocked — allow it in the browser.',
  error: 'Could not determine your location.',
};

/**
 * The liguria-events-site locate flow, ported: getCurrentPosition is
 * called SYNCHRONOUSLY inside the click gesture (browsers only raise
 * the permission prompt from within it); a previously denied origin
 * lands in the error callback with code 1 → the "blocked" toast.
 */
export const runLocate = (hooks: LocateHooks): void => {
  const request = (): void => {
    hooks.setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        hooks.setBusy(false);
        const at = {
          lon: position.coords.longitude,
          lat: position.coords.latitude,
        };
        appState.mePosition.set(at);
        hooks.setToast(
          { true: '', false: MESSAGES['outside'] ?? '' }[
            `${inMapArea(at.lon, at.lat)}`
          ] ?? '',
        );
      },
      (error) => {
        hooks.setBusy(false);
        hooks.setToast(
          { true: MESSAGES['denied'], false: MESSAGES['error'] }[
            `${error.code === error.PERMISSION_DENIED}`
          ] ?? '',
        );
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 },
    );
  };
  ({
    true: () => hooks.setToast(MESSAGES['error'] ?? ''),
    false: request,
  })[`${!('geolocation' in navigator)}`]();
};
