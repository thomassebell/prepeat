import Constants from 'expo-constants';

/**
 * Which build of the app this is.
 *
 * ⚠️ THIS IS NOT `__DEV__`, AND THE DIFFERENCE MATTERS. `__DEV__` is false in any
 * RELEASE build – including the one `scripts/build-iphone.sh` puts on Thomas's
 * phone. So `__DEV__` does not mean "Thomas's test build", it means "running
 * from the Metro dev client", and gating a feature on it hides that feature from
 * the very device it is meant to be tried on. Found 2026-08-17, one command
 * before building a phone that would have shown nothing new.
 *
 * The honest signal is the bundle id. `app.config.js` gives the dev build its
 * own (`app.prepeat.dev`) so it installs beside the real app; only a production
 * build – TestFlight or the App Store – keeps `app.prepeat`.
 *
 * Use this for anything that should reach Thomas's phone but must not reach
 * users: a feature whose backend is live but whose front end is not yet, a
 * diagnostic, a half-finished screen.
 */
export const IS_DEV_APP =
  Constants.expoConfig?.ios?.bundleIdentifier === 'app.prepeat.dev' ||
  Constants.expoConfig?.android?.package === 'app.prepeat.dev';
