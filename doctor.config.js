/** @type {import('react-doctor').Config} */
module.exports = {
  rules: {
    // Only ever fires on .github/workflows/ci.yml's Maestro CLI install
    // step (curl | bash). That's Maestro's own official documented
    // install command (https://docs.maestro.dev/getting-started/installing-maestro)
    // — same pattern as rustup/nvm/homebrew installers — and Maestro
    // doesn't publish a pinned/checksummed alternative for CI use.
    // Inline suppression (react-doctor-disable-next-line) doesn't get
    // picked up inside a YAML run: | block, so this is disabled at the
    // rule level instead — re-enable and re-check if this ever fires
    // somewhere else in the project.
    'react-doctor/plugin-update-trust-risk': 'off',
  },
};
