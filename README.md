# veo-web

> Veo Web Frontend

## Build Setup

```bash
# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

Required env variables:
```
VEO_API_URL=https://api.develop.verinice.com/
VEO_OIDC_URL=https://auth.staging.verinice.com/auth
VEO_OIDC_REALM=verinice-veo
VEO_OIDC_CLIENT=veo-development-client
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).

## vue-query Debugging
Debugging can be enabled by setting the `VEO_DEBUG_CACHE` variable to `true` or an array containing the first part of each query key you want to debug, eg. `VEO_DEBUG_CACHE=['objects','monitoring']`. Debugging can also be enabled at runtime by setting `$nuxt.$config.debugCache` to one of the aforementioned values.

## License headers
Each file has to contain a license header. This project contains configuration for the VSCode Plugin [psioniq File Header](https://marketplace.visualstudio.com/items?itemName=psioniq.psi-header). If you use this plugin, the license header will get automatically generated for new files and files that don't contain a header yet. Please add your name to the license header of every file you make meaningful changes in.

## License generation
To regenerate the `LICENSE-3RD-PARTY.txt` file, run `npx generate-license-file --input .\package.json --output LICENSE-3RD-PARTY.txt`

## License
verinice.veo is released under GNU AFFERO GENERAL PUBLIC LICENSE Version 3 (see LICENSE.txt) and uses third party libraries that are distributed under their own terms (see LICENSE-3RD-PARTY.txt).
