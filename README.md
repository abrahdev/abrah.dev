# abrah.dev

Portfolio personal construido con Astro y TailwindCSS.

[![Previsualización](https://abrah.dev/preview.png)](https://abrah.dev)

## Contenido

El contenido es la fuente única de [`abrahdev/content`](https://github.com/abrahdev/abrahdev/tree/main/content).
En cada build se descarga [`profile.json`](https://raw.githubusercontent.com/abrahdev/abrahdev/main/profile.json);
si falla la red o el JSON no es válido, se usa `src/data/profile.fallback.json`.

El CV enlaza al PDF del repo de `abrahdev`, que se regenera con cada cambio de contenido.

## Comandos

```sh
pnpm dev            # servidor de desarrollo
pnpm build          # build estático en dist/
pnpm preview        # sirve dist/
pnpm sync:profile   # actualiza el fallback con el profile.json remoto
pnpm shot           # captura public/preview.png (requiere dist/)
pnpm preview:shot   # build + captura
```

## Previsualización

`.github/workflows/preview.yml` ejecuta `pnpm preview:shot` en cada push a `main`
y commitea `public/preview.png`. La imagen se sirve en `/preview.png`.
