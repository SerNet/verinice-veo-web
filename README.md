# veo-web

Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

## Setup

Make sure to install the dependencies:

```bash
npm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Checkout the [deployment documentation](https://v3.nuxtjs.org/guide/deploy/presets) for more information.

Required env variables:
```
VEO_API_URL=https://api.verinice.com/
VEO_OIDC_URL=https://auth.verinice.com/auth
VEO_OIDC_REALM=verinice-veo
VEO_OIDC_CLIENT=veo-prod
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

## Technical debt
* All translations used by the `<i18n-t>` component are currently present in the language files and the components they
get used in because of this bug: https://github.com/intlify/vue-i18n-next/issues/1248 (currently we use v8.0.0-beta, however the fix is only available for 7.3.1).
The translations should get removed from the language files if the fix is also available for v8.x.
* VSkeletonLoader, VDateInput, VTimeInput, VSpeedDial, VEditDialog and VDataIterator are not yet ported to nuxt 3 (vuetify v3.1), so we currently use local polyfills. Should get replaced by the vuetify components once available as they are more feature rich, more accessible and provide a better UI/UX.
* The editors were useful to develop all object and formschemas, however constant modifications of them have left a toll on them. Should get integrated into a new, combinded editor, joining the domain editor.
* Externalize-Scripts: Currently there is no "after-everything" hook for node, so the externalize-scripts.mjx file HAS to be called after generating the application if you want to use the frontend in production (due to CSP)

## Documentation
Use the `DocsLink` component for all **internal** links instead of `<nuxt-link>`, as `<nuxt-link>` won't work in the pdf.
Also remove `index` from all links in order for PDF navigation to work correctly.

## vue-query Debugging
Debugging can be enabled by setting the `VEO_DEBUG_CACHE` variable to `true` or an array containing the first part of each query key you want to debug, eg. `VEO_DEBUG_CACHE=["objects","monitoring"]`.

## License headers
Each file has to contain a license header. This project contains configuration for the VSCode Plugin [psioniq File Header](https://marketplace.visualstudio.com/items?itemName=psioniq.psi-header). If you use this plugin, the license header will get automatically generated for new files and files that don't contain a header yet. Please add your name to the license header of every file you make meaningful changes in.

## License generation
To regenerate the `LICENSE-3RD-PARTY.txt` file, run `npx generate-license-file --input ./package.json --output LICENSE-3RD-PARTY.txt --overwrite`

## License
verinice.veo is released under GNU AFFERO GENERAL PUBLIC LICENSE Version 3 (see LICENSE.txt) and uses third party libraries that are distributed under their own terms (see LICENSE-3RD-PARTY.txt).
