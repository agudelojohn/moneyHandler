# moneyhandler

Proyecto base **Hello World** con:

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Material UI (MUI)](https://mui.com/)

## Requisitos

- Node.js 20+ (recomendado LTS)
- npm

## Ejecutar en desarrollo

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

- `npm run dev`: levanta el servidor de desarrollo.
- `npm run build`: compila la app para producción.
- `npm run start`: ejecuta la versión compilada.
- `npm run lint`: corre ESLint.

## Estructura relevante

- `app/layout.tsx`: layout principal y provider global.
- `app/providers.tsx`: configuración de `ThemeProvider` y `CssBaseline` de MUI.
- `app/theme.ts`: tema base de Material UI.
- `app/page.tsx`: pantalla inicial "Hello World".
