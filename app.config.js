// Dynamic Expo config layered on top of app.json.
//
// The direct-to-device "dev" build (APP_VARIANT=dev, set by
// scripts/build-iphone.sh and the EAS development/preview profiles) gets its
// OWN bundle id, home-screen name and icon, so it installs ALONGSIDE the real
// app instead of overwriting it – you can tell at a glance which build is on
// the phone. Only a production build (TestFlight / App Store) leaves
// APP_VARIANT unset and keeps the real Prep+Eat identity.
//
// The Expo `name` is deliberately NOT changed – it drives the native Xcode
// project/scheme name ("PrepEat"), which scripts/build-iphone.sh hardcodes.
// The dev label is set via CFBundleDisplayName instead, which only affects the
// text under the icon.
//
// ⚠️ EACH BUILD CLAIMS ONLY ITS OWN SHARE HOST, and this is a bug fix, not
// tidying (2026-08-19). Both builds used to claim BOTH hosts – app.json listed
// `share.prepeat.app` and `share-dev.prepeat.app`, and the dev override did not
// touch the list. With both apps installed, iOS could hand ANY share link to
// EITHER app. The dev app reads the dev database and the real app reads
// production, so a link opened by the wrong one found no row and showed
// "This link doesn't lead anywhere" – indistinguishable from a genuinely broken
// link. Thomas hit it within two minutes of the first Stop sharing test.
//
// The entitlement is the binding half of the handshake: an app that does not
// claim a domain cannot be handed its links, whatever the site's AASA says. So
// this split is what actually fixes it – the AASA files were narrowed to match
// so the two halves cannot drift apart again.

const IS_DEV = process.env.APP_VARIANT === 'dev';

module.exports = ({ config }) => {
  if (!IS_DEV) return config;
  return {
    ...config,
    icon: './assets/images/icon-dev.png',
    ios: {
      ...config.ios,
      bundleIdentifier: 'app.prepeat.dev',
      infoPlist: {
        ...config.ios?.infoPlist,
        CFBundleDisplayName: 'Prep+Eat Dev',
      },
      // REPLACED, not extended: app.json's list is the production one.
      associatedDomains: ['applinks:share-dev.prepeat.app'],
    },
    android: {
      ...config.android,
      package: 'app.prepeat.dev',
    },
  };
};
