# veo-web

Welcome to the GitHub repository for the web frontend of the **verinice.veo** tool, the next generation solution for data protection and information security management. Leveraging modern web technologies, this software-as-a-service (SaaS) solution aims to provide a user-friendly and comprehensive approach to fulfilling data protection obligations in accordance with GDPR, ISO 27001 and other regulations. Whether you are a novice or a professional, the tool facilitates easy data collection, intuitive operation, and the generation of valuable reports, all within a web-based environment. Developed by the experienced verinice team, this frontend is part of a continuous development effort to build upon a legacy of expertise dating back to 2007 and over 10.000 customers worldwide, aiming to create a flexible, reliable, and efficient security management tool. Explore the repository to learn more about how **verinice.veo** is shaping the future of data protection and information security management.

![Screenshot](readme_imgs/dashboard.png)

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Server](#development-server)
- [Production Build](#production)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Technical Debt](#technical-debt)
- [Documentation](#documentation)
- [Vue Query Debugging](#vue-query-debugging)
- [Code Formatting](#code-formatting)
- [License Headers](#license-headers)

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v20 or later)
- **npm** (comes with Node.js)
- A terminal or shell environment
- A modern browser (for local testing)

Check versions:

```bash
node -v
npm -v
```

## Setup

Make sure to install the dependencies:

```bash
npm ci
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

The official method for building the app for production is defined in the [`Dockerfile`](./Dockerfile), which uses:

```bash
npm run generate
```

Checkout the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://nuxt.com/docs).

## Project Structure

```bash
├── components/   # Reusable Vue components #
├── composables/  # Shared logic and hooks #
├── pages/        # Nuxt 3 file-based routing #
├── plugins/      # Nuxt plugins (e.g. vue-query, i18n) #
├── public/       # Static assets #
├── cypress/      # End-to-end tests and accessibility tests#
├── types/        # TypeScript definitions #
├── configuration/ # configuration domains #
├── content/       # Interactive Guided Tour #
└── nuxt.config.ts  # Nuxt configuration#
```

## Environment variables

| Environment variable | Default value | What does it do? |
| --- | --- | --- |
| `npm_package_version` | `latest` | Gets automatically set during build time, displays Frontend version in "About verinice." dialog. |
| `CI_COMMIT_SHORT_SHA` | `0000000` | Short Hash of commit of current build. Gets displayed in "About verinice." dialog |
| `CI_COMMIT_TIMESTAMP` | ` Date.now().toString()` | Date of current build. Gets set to current date and time when developing.Gets displayed in "About verinice." dialog |
| `CI_JOB_ID` | ` -1` | Current build ID. Gets displayed in "About verinice." dialog |
| `VEO_DEFAULT_API_URL` | `https://api.veo.example/veo` | URL of the core api. Gets used throughout the application to fetch objects, catalogs, etc.. |
| `VEO_FORMS_API_URL` | `https://api.veo.example/forms` | URL of the forms api. Gets used throughout the application to load forms that display objects. |
| `VEO_HISTORY_API_URL` | `https://api.veo.example/history` | URL of the history api. Gets used to fetch previous versions of an object |
| `VEO_REPORTING_API_URL` | `https://api.veo.example/reporting` | URL of the reports api. Gets used to generate reports. |
| `VEO_ACCOUNTS_API_URL` | `https://api.veo.example/accounts` | URL of the accounts api. Gets used to modify/create accounts apart from the client owner. |
| `VEO_OIDC_URL` | `https://auth.veo.example/auth` | URL of the OIDC provider (usually keycloak). |
| `VEO_OIDC_REALM` | `veo-oidcrealm-example` | Realm you use for veo in your OIDC provider. |
| `VEO_OIDC_CLIENT` | `veo-oidcclient-example` | Client name you use for this webapp in your OIDC provider. |
| `VEO_ACCOUNT_PATH` | `https://account.veo.example` | URL under which the user can edit his/her subscription. |
| `VEO_OIDC_ACCOUNT_APPLICATION` | `https://auth.veo.example/auth/realms/veo-oidcrealm-example/account` | URL under which the user can self manage his/her account. |
| `VEO_DOCUMENTATION_URL` | `https://veo-docs.develop.verinice.com` | URL under which the user can access the official documentation for verinice.veo. |
| `VEO_DEBUG` | `false` | While not exposing any critical information, this variable should only be set to true when developing. |
| `VEO_DEBUG_CACHE` | `false` | If set to true, additional logging output gets set regarding caching and retrieving of data. |
| `VEO_BETA_MODE` | `false` | If set to true, the toggle button for the table/card view will be avaialble. |
| `VEO_FEATURE_FLAG_CARD_VIEW` | `false` | If set to true, the toggle for feature flag card view gets enabled |
| `VEO_FEATURE_FLAG_USER_SETTINGS` | `false` | If set to true, the user settings page will be available. |
| `VEO_HIDE_SERNET_REFERENCES` | `false` | If set to true, logos, URLs, and images related to SerNet will be disabled. |

Required env variables (prod preset):

```
VEO_DEFAULT_API_URL=https://api.verinice.com/
VEO_FORMS_API_URL=https://api.verinice.com/forms
VEO_HISTORY_API_URL=https://api.verinice.com/history
VEO_REPORTING_API_URL=https://api.verinice.com/reporting
VEO_ACCOUNTS_API_URL=https://api.verinice.com/accounts
VEO_OIDC_URL=https://auth.verinice.com/auth
VEO_OIDC_REALM=verinice-veo
VEO_OIDC_CLIENT=veo-prod
VEO_ACCOUNT_PATH=https://account.verinice.com
VEO_OIDC_ACCOUNT_APPLICATION=https://auth.verinice.com/auth/realms/verinice-veo/account
VEO_DOCUMENTATION_URL=https://veo-docs.develop.verinice.com
```

## Technical Debt

The following known technical limitations are being tracked and should be addressed in future development cycles:

- **Vuetify 3 Compatibility:**  
  Components like `VSkeletonLoader`, `VDateInput`, `VTimeInput`, `VSpeedDial`, `VEditDialog`, and `VDataIterator` have not been ported to Nuxt 3 / Vuetify v3.1. We use local polyfills for now, which should be replaced once official versions are available.

- **Schema Editors:**  
  The object and form schema editors have become difficult to maintain due to ongoing modifications. We plan to merge them into a unified domain editor.

- **Externalize Scripts Manual Step:**  
  The file `externalize-scripts.mjx` must be executed manually after generating the application, due to the lack of a proper post-generation hook in Node. This step is necessary to meet CSP requirements when running the app in production.

## Documentation

Use the `DocsLink` component for all **internal** links instead of `<nuxt-link>`, as `<nuxt-link>` won't work in the pdf. Also remove `index` from all links in order for PDF navigation to work correctly.

## Vue Query Debugging

Debugging can be enabled by setting the `VEO_DEBUG_CACHE` variable to `true` or an array containing the first part of each query key you want to debug, eg. `VEO_DEBUG_CACHE=["objects","monitoring"]`.

## Code Formatting

To ensure consistent code style across the project, use the following command to format all files:

```bash
npm run format:all
```

## License Headers

Each file has to contain a license header. Please add your name to the license header of every file you make meaningful changes in.

## License

verinice.veo is released under GNU AFFERO GENERAL PUBLIC LICENSE Version 3 (see LICENSE.txt) and uses third party libraries that are distributed under their own terms.
