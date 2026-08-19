# Lujaneritos — sitio web oficial

Web de **Lujaneritos**, asociación civil sin fines de lucro de Luján (Buenos Aires) que desde 2019 rescata perros y gatos en situación de calle, los recupera y les busca un hogar definitivo.

🔗 **https://lujaneritos.com.ar**

Instagram: [@lujaneritos](https://www.instagram.com/lujaneritos/) · [Facebook](https://www.facebook.com/lujaneritos/) · [TikTok](https://www.tiktok.com/@lujaneritos)

---

## Cómo está hecho

HTML + CSS + JavaScript, sin frameworks y **sin paso de compilación**. Se abre `index.html` en el navegador y funciona. Se publica solo con GitHub Pages.

- Mobile-first (la mayoría entra desde el celular)
- Sin backend, sin base de datos, sin dependencias
- **Costo: $0 por mes**, para siempre

```
├── index.html            → toda la página
├── 404.html
├── css/index.css         → estilos (la paleta está arriba de todo, en :root)
├── js/index.js           → scripts (la configuración está arriba de todo, en CONFIG)
├── data/adoptables.json  → animales en adopción (sección apagada por ahora)
├── assets/
│   ├── images/           → fotos de rescatados e historias
│   ├── images_marca/     → logo, favicon, imagen para compartir
│   └── qr/               → QR de MercadoPago
├── CNAME                 → el dominio propio
├── robots.txt, sitemap.xml, manifest.json, .nojekyll
```

---

## Qué falta cargar

Todo lo pendiente está marcado en el código con el comentario `TODO:DATO`. Para verlos todos:

```bash
grep -rn "TODO:DATO" --include="*.html" --include="*.css" --include="*.js" .
```

### Datos (los cambiás en un solo lugar)

| Qué | Dónde |
|---|---|
| **Número de WhatsApp** | `js/index.js` → `CONFIG.WHATSAPP` — ✅ cargado |
| **Prender la sección de adoptables** | `js/index.js` → `CONFIG.ADOPTABLES_ACTIVO = true` |
| **Alias de MercadoPago** | `index.html` → `id="alias-valor"` — ✅ cargado |
| **Titular de la cuenta** | `index.html` → bloque comentado bajo el alias |
| **Links de pago por monto** | opcional: `data-link` en cada botón de `.montos__grid` |
| **Colores de la marca** | `css/index.css` → bloque `:root` — ✅ tomados del logo |

### Imágenes

| Archivo | Qué es |
|---|---|
| `assets/images_marca/logo.png` | Logo, fondo transparente |
| `assets/images_marca/favicon.png` | Ícono de la pestaña, 192×192 |
| `assets/images_marca/og-image.jpg` | Imagen al compartir por WhatsApp, **1200×630** |
| `assets/qr/mercadopago.png` | QR de cobro (app MP → Cobros → Tu QR) |
| `assets/images/hero.webp` | Foto grande del inicio |
| `assets/images/*` | Fotos de historias y del equipo |

> Convertí las fotos a **WebP** y dejalas por debajo de ~200 KB. Es lo que hace que la página cargue rápido con datos móviles.

Mientras falten, se ven recuadros punteados que dicen "pendiente". No hay imágenes rotas.

---

## Prender la sección de adoptables

1. En `js/index.js`, poner `ADOPTABLES_ACTIVO: true`.
2. Cargar los animales en `data/adoptables.json`:

```json
[
  {
    "nombre": "Toto",
    "edad": "2 años",
    "tamano": "Mediano",
    "sexo": "Macho",
    "descripcion": "Sociable con otros perros y muy compañero.",
    "foto": "/assets/images/adoptables/toto.webp"
  }
]
```

Cuando está en `true`, la sección aparece sola y se oculta el bloque que manda a las redes.

---

## Ver la página localmente

Abrir `index.html` directo en el navegador alcanza para casi todo. Para que funcione la carga de adoptables (que usa `fetch`) hace falta un servidor:

```bash
npx -y serve -l 8080 .
```

Y entrar a `http://localhost:8080`.

---

## Publicar

El sitio se publica solo: **cada push a `main` actualiza la web en un par de minutos.**

```bash
git add . && git commit -m "Actualizo la web" && git push
```

### Configuración inicial (una sola vez)

**1. GitHub Pages** — ya activado (branch `main`, raíz, con el dominio del `CNAME`).

**2. Cloudflare** → *Add a site* → `lujaneritos.com.ar` → plan **Free**.
Al terminar te da dos nameservers, del estilo `xxx.ns.cloudflare.com`.

**3. NIC.ar** → iniciar sesión → *Mis dominios* → `lujaneritos.com.ar` → **Delegaciones**.
Reemplazar los nameservers por los dos de Cloudflare y guardar.
La propagación puede tardar de minutos a varias horas.

**4. Cloudflare → DNS** → agregar cinco registros:

| Tipo | Nombre | Contenido | Proxy |
|---|---|---|---|
| A | @ | 185.199.108.153 | **DNS only** (nube gris) |
| A | @ | 185.199.109.153 | **DNS only** |
| A | @ | 185.199.110.153 | **DNS only** |
| A | @ | 185.199.111.153 | **DNS only** |
| CNAME | www | juanchoalfonso.github.io | **DNS only** |

> ⚠️ Los cinco tienen que quedar en **DNS only** (nube gris), no en Proxied (naranja).
> Con el proxy activado GitHub no puede validar el dominio para emitir el
> certificado, y *Enforce HTTPS* nunca se habilita. Es el error más común de
> este setup.

**5. GitHub** → Settings → Pages → esperar a que aparezca el tilde verde en el
dominio y tildar **Enforce HTTPS**. Puede tardar hasta 24 h en habilitarse.

**6. (Opcional, después)** Si más adelante querés el proxy de Cloudflare (caché y
analytics), recién ahí pasá los registros a Proxied y poné **SSL/TLS → Full**.
Nunca *Flexible*: hace un bucle de redirección infinito con GitHub Pages.

### Verificar que salió bien

```bash
curl -sI https://lujaneritos.com.ar | head -1
```

Tiene que devolver `HTTP/2 200`.

## Después de publicar

- [ ] **Google Search Console** — verificar el dominio y enviar `sitemap.xml`. Sin esto, Google tarda semanas en indexar.
- [ ] **Perfil de Empresa de Google** — gratis, y es lo que los hace aparecer en Maps y en el panel lateral al buscar "protectora Luján". Para búsqueda local pesa más que la web misma.
- [ ] Poner `lujaneritos.com.ar` en la bio de Instagram, Facebook y TikTok.
- [ ] Pedirle a [LujánHoy](https://www.lujanhoy.com.ar/) que enlace la web en sus notas.
- [ ] Validar el JSON-LD en la Prueba de Resultados Enriquecidos de Google.
- [ ] Probar una donación real de $100 de punta a punta, escaneando el QR desde un teléfono.

---

## Una regla

**Ningún dato inventado.** Cifras de rescatados, costos de una vacuna, cantidad de adoptados: todo confirmado por la organización o no va. Es una ONG que pide plata; un número falso les rompe la credibilidad.

Por eso los montos sugeridos de la sección de donaciones son sólo cifras, sin decir qué compra cada una: hasta que la organización confirme los costos reales, esa equivalencia no se publica.

---

Hecho sin costo para Lujaneritos. 🐾
