---
worth: maybe
where: webpack.config.js
added: 2026-11-20
---
# build tooling is on webpack 4, which blocks two dependabot updates

The repo builds with webpack 4, webpack-cli 3, webpack-dev-server 3, css-loader 2, jest 24, ts-jest 24
and typescript 3.4. About 100 dependabot alerts stay open on that tree, mostly in build and test tooling.

- #117 webpack-dev-server 3 -> 5 and the css-loader 7 bump in #118 require webpack 5.
- The postcss fix in #118 and the form-data fix (master still resolves form-data 2.3.3 through request)
  may ship as independent updates; #113, which carried form-data with jest 30, ts-jest 29 and node-sass,
  was closed as obsolete.
- jest 30 / ts-jest 29 need a newer typescript and a replacement for the enzyme/preact-compat test setup.

A webpack 5 migration (loaders, plugins, devServer config) unblocks #117 and the css-loader bump in #118.
Whether that is worth doing depends on how long this UI keeps being built and served.
