# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Comandos

```sh
npm install
npm run dev       # astro dev -> localhost:4321
npm run build     # salida estatica en ./dist
npm run preview   # sirve ./dist
npm run astro -- check   # type-check (tsconfig extiende astro/tsconfigs/strict)
```

No hay tests ni linter configurados: `astro check` es la unica verificacion automatica.

## Que es

Sitio de marketing estatico de SmartCheck CR (inspeccion vehicular en Costa Rica), Astro 5 + Tailwind 3, `output: 'static'`. Todo el contenido esta en espanol (`lang="es-CR"`), los precios en colones (CRC), y los mensajes de commit tambien van en espanol. Repo: `GreetyCr/smartcheck-cr`; deploy a Vercel por integracion de git (push a la rama = deploy).

Sin islas ni frameworks de UI: cero componentes React/Vue/Svelte. La interactividad es un `<script>` inline en `BaseLayout.astro` para el menu movil y, solo cuando el build trae `PUBLIC_POSTHOG_KEY`, el snippet de PostHog (`src/components/PostHog.astro`).

## Arquitectura

`src/layouts/BaseLayout.astro` es el archivo central y concentra casi todo lo global:

- `<head>` completo: meta/OG/Twitter, verificacion de Google, manifest PWA, estilos criticos inline.
- El bloque JSON-LD `LocalBusiness` con telefono, redes y el catalogo de servicios **con precios**.
- El header (nav desktop + nav movil, cada enlace duplicado en ambos) y el footer completo.
- Props: `title`, `description`, `canonicalURL?`, `image?`. El `<title>` se arma como `${title} | SmartCheck CR`.

Cada pagina de `src/pages/*.astro` envuelve su contenido en `BaseLayout`. `src/layouts/BlogPost.astro` envuelve a su vez `BaseLayout` y anade cabecera de articulo, fecha con `date-fns`/locale `es`, y una lista de articulos relacionados **hardcodeada**.

El blog usa el patron antiguo de Astro (no content collections): cada post es un `.md` en `src/pages/blog/` que declara `layout: ../../layouts/BlogPost.astro` en su frontmatter, junto con `title`, `description`, `pubDate`, `category`, `image`, `author`, `readingTime`. Anadir un post = crear el `.md`; el listado en `src/pages/blog/index.astro` y el `sitemap.xml` se actualizan a mano.

`src/components/GoogleReviews.astro` son 3 resenas reales copiadas a mano desde Google Maps, no una integracion con la API.

## Gotchas verificados

**Hay dos configs de Tailwind y solo `tailwind.config.cjs` esta activa.** Tailwind resuelve `.js` -> `.cjs` -> `.mjs`; como no existe `.js`, gana el `.cjs`. Consecuencias comprobadas contra `dist/`:

- Editar `tailwind.config.mjs` no tiene ningun efecto. Los tokens vivos son solo `smartcheck-blue` (`#004AAD`) y `smartcheck-accent` (`#FFB700`) — ojo, el `.mjs` muerto define el accent como `#FFDE59`.
- `@tailwindcss/typography` **no** se carga. Las clases `prose prose-lg` en `BlogPost.astro` funcionan solo por el CSS escrito a mano en el `<style>` de ese mismo archivo.
- `smartcheck-bg` no compila: se usa 4 veces (`metodos-de-pago.astro`, `sobre-nosotros.astro`) y no genera ninguna regla.

**Las URLs absolutas dependen de `site`.** `astro.config.mjs` define `site: 'https://smartcheckcr.com'` y `BaseLayout` deriva de ahi la canonica, `og:url` y `og:image`/`twitter:image`. Si se quita `site`, el build vuelve a emitir `http://localhost:4321` en todas las paginas sin fallar. La canonica se emite **sin barra final** a proposito, para coincidir con las `<loc>` de `public/sitemap.xml`; si algun dia se automatiza el sitemap hay que revisar que ambos sigan de acuerdo.

**El frontmatter de un `.md` llega como `Astro.props.frontmatter`, no como props sueltas.** `BlogPost.astro` lo desestructura desde ahi (`Astro.props.frontmatter ?? Astro.props`). Leerlo directo de `Astro.props` compila sin error pero deja `title`/`description` vacios: asi estuvieron los 4 articulos hasta el 2026-09-01. Al tocar ese layout, verificar el `<title>` en `dist/blog/<slug>/index.html`, no solo en el navegador.

**`public/sitemap.xml` es manual** (no esta `@astrojs/sitemap`). Cada pagina o post nuevo hay que agregarlo a mano; todos los `lastmod` actuales dicen `2025-01-11`.

**`vite.config.js` en la raiz es codigo muerto.** Astro no lee configs de Vite sueltos; la configuracion real de Vite esta en la clave `vite:` de `astro.config.mjs`. Tocar el de la raiz no hace nada.

**PostHog solo carga si `PUBLIC_POSTHOG_KEY` esta en el entorno del build.** `src/components/PostHog.astro` (incluido en el `<head>` de `BaseLayout`) lee la clave de `import.meta.env` y la recorta con `.trim()`; sin clave, o con una de solo espacios, no renderiza nada y el HTML no trae ni una linea de PostHog (`grep -rli posthog dist` tiene que dar 0). Es una variable de build: se hornea en el HTML estatico, asi que cambiarla en Vercel exige un redeploy. Reglas: la clave va solo en el entorno **Production** de Vercel, para que los previews y el desarrollo local queden apagados; para probar en local se pasa en el comando (`PUBLIC_POSTHOG_KEY=phc_... npm run build`), nunca en un archivo commiteado (`.env.example` va vacio); las opciones de `init` tienen que coincidir con la sec. 10 de la Politica de privacidad, y si cambian hay que cambiar el texto legal.

**`public/sw.js` nunca se registra** — no hay ningun `navigator.serviceWorker.register` en el proyecto. El `manifest.json` si esta enlazado desde `BaseLayout`.

**`public/.htaccess`** (compresion + cache de Apache) es inerte en Vercel; sobrevive de un hosting anterior.

**Dependencias declaradas y sin usar:** `astro-compress`, `compression`, `@astrojs/markdown-remark` — ninguna aparece en `integrations` ni se importa.

## Datos que se duplican

Al cambiar precios de servicio (₡59.000 / ₡64.000 / ₡69.000 / ₡85.000) hay que tocar **dos** lugares: la seccion de precios de `src/pages/contacto.astro` (el ancla publica es `/contacto#precios`, no `/servicios`) y el `hasOfferCatalog` del JSON-LD en `BaseLayout.astro`.

`datos-smartcheck.txt` en la raiz es la fuente de verdad del cliente (telefono +506 8675 2713, email, TikTok/Instagram, estadisticas: 900+ vehiculos, +230 puntos, fundacion 2022), pero esos valores estan hardcodeados en `BaseLayout` y varias paginas. `estrategias-blog-seo.txt` es el plan de contenido SEO.

## Restos del template

`README.md` sigue siendo el del starter `basics` de Astro y `package.json` se llama `@example/basics`; ninguno describe este proyecto. `src/components/Welcome.astro` y `src/assets/astro.svg`/`background.svg` son del template y no se usan en ninguna pagina.
