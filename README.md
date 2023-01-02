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

## Documentation
Use the `DocLink` component for all **internal** links instead of `<nuxt-link>`, as `<nuxt-link>` won't work in the pdf.
Also remove `index` from all links in order for PDF navigation to work correctly.

## vue-query Debugging
Debugging can be enabled by setting the `VEO_DEBUG_CACHE` variable to `true` or an array containing the first part of each query key you want to debug, eg. `VEO_DEBUG_CACHE=['objects','monitoring']`. Debugging can also be enabled at runtime by setting `$nuxt.$config.debugCache` to one of the aforementioned values.

## License headers
Each file has to contain a license header. This project contains configuration for the VSCode Plugin [psioniq File Header](https://marketplace.visualstudio.com/items?itemName=psioniq.psi-header). If you use this plugin, the license header will get automatically generated for new files and files that don't contain a header yet. Please add your name to the license header of every file you make meaningful changes in.

## License generation
To regenerate the `LICENSE-3RD-PARTY.txt` file, run `npx generate-license-file --input ./package.json --output LICENSE-3RD-PARTY.txt --overwrite`

## License
verinice.veo is released under GNU AFFERO GENERAL PUBLIC LICENSE Version 3 (see LICENSE.txt) and uses third party libraries that are distributed under their own terms (see LICENSE-3RD-PARTY.txt).
