This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, enable corepack `corepack enable`

Install dependencies `pnpm install`
If dependencies change or versions in lockfile need to be updated use `pnpm install --no-frozen-lockfile`

Then, run the development server:

```bash

pnpm dev

```

Open [http://localhost:3123](http://localhost:3123) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Translations (Tolgee)

You need to request access to [Tolgee](https://app.tolgee.io/) for access to translations, after which you can put following to `.env.development.local`

```text
NEXT_PUBLIC_TOLGEE_API_KEY=<key>
NEXT_PUBLIC_TOLGEE_API_URL=https://app.tolgee.io
```

Tolgee also has a [browser plugin](https://tolgee.io/apps-integrations/tools) which allows you to edit translations directly on the page by pressing Alt/Option and hovering over text.

See [further instructions](https://virkailija.untuvaopintopolku.fi/lokalisointi/secured/index.html) on access and copying master translations to other environments.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
