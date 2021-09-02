# Create React Figma Plugin

Create React Figma Plugin with no build configuration.

This demonstrates:

- bundling plugin code using Webpack
- using React with TSX
- dependency management under Yarn
- linting utility using ESLint
- formatting using Prettier

The main plugin code is in `src/code.ts`. The HTML for the UI is in
`src/ui.html`, while the embedded JavaScript is in `src/ui.tsx`.

These are compiled to files in `dist/`, which are what Figma will use to run
your plugin.

To use:

    $ yarn
    $ yarn start
    $ yarn lint
    $ yarn build
