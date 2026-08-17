import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Device-local app preferences.
 *
 * Deliberately NOT household columns and not profile columns: "keep the screen
 * on" is a property of the phone propped up on the worktop, not of the person
 * or the kitchen. Someone reading a recipe on a tablet on the sofa and someone
 * cooking from a phone want opposite answers, and both may be the same user in
 * the same household. Same reasoning as ACTIVE_HOUSEHOLD_KEY in _layout.tsx.
 *
 * A consequence worth knowing: nothing syncs, so this survives an app update
 * but not a reinstall, and it does not follow the user to a second device.
 */
const KEEP_AWAKE_KEY = 'prepeat.keep-screen-awake.v1';

/**
 * ON by default (Thomas, 2026-08-17). The whole point of the feature is the
 * phone that dims every 30 seconds mid-recipe, and a fix nobody finds is not a
 * fix. The cost is that someone merely browsing recipes also gets an always-on
 * screen – which is exactly why the recipe screen carries a visible line
 * saying so and pointing at Settings, rather than doing this silently.
 */
const KEEP_AWAKE_DEFAULT = true;

interface Preferences {
  /** Whether an open recipe holds the screen awake. */
  keepScreenAwake: boolean;
  setKeepScreenAwake: (next: boolean) => void;
  /** False until AsyncStorage has been read, so UI can avoid showing the
   *  default as though it were the stored choice. */
  loaded: boolean;
}

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [keepScreenAwake, setValue] = useState(KEEP_AWAKE_DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEEP_AWAKE_KEY)
      .then((stored) => {
        if (cancelled) return;
        // Only an explicit 'false' overrides the default – an absent key is a
        // user who has never touched the setting, not a user who turned it off.
        if (stored != null) setValue(stored === 'true');
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setKeepScreenAwake = useCallback((next: boolean) => {
    // Optimistic: the switch must move under the finger. A failed write means
    // the choice is forgotten at next launch, which is not worth a dialog.
    setValue(next);
    AsyncStorage.setItem(KEEP_AWAKE_KEY, String(next)).catch((error) =>
      console.warn('[preferences] could not save keep-screen-awake', error),
    );
  }, []);

  const value = useMemo(
    () => ({ keepScreenAwake, setKeepScreenAwake, loaded }),
    [keepScreenAwake, setKeepScreenAwake, loaded],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): Preferences {
  const context = useContext(PreferencesContext);
  if (context == null) {
    throw new Error('usePreferences must be used inside a PreferencesProvider');
  }
  return context;
}
