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
| **Número de WhatsApp** | `js/index.js` → `CONFIG.WHATSAPP` |
| **Prender la sección de adoptables** | `js/index.js` → `CONFIG.ADOPTABLES_ACTIVO = true` |
| **Alias de MercadoPago** | `index.html` → `id="alias-valor"` |
| **Titular de la cuenta** | `index.html` → clase `alias__titular` |
| **Links de pago por monto** | `index.html` → los `href` dentro de `.montos__grid` |
| **CUIT y personería jurídica** | `index.html` → clase `footer__legal-datos` |
| **Colores de la marca** | `css/index.css` → bloque `:root` |

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
python -m http.server 8080
```

Y entrar a `http://localhost:8080`.

---

## Publicar

El sitio se publica solo: **cada push a `main` actualiza la web en un par de minutos.**

```bash
git add . && git commit -m "Actualizo la web" && git push
```

### Configuración inicial (una sola vez)

1. **GitHub Pages** → Settings → Pages → Source: `main`, carpeta `/ (root)`.
2. **NIC.ar** → delegar los nameservers del dominio a Cloudflare.
3. **Cloudflare** → DNS:
   - 4 registros `A` en `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro `CNAME` en `www` → `juanchoalfonso.github.io`
4. **Cloudflare → SSL/TLS → modo `Full`**. ⚠️ Si queda en `Flexible`, GitHub Pages entra en un bucle de redirección infinito y la página no carga. Es el error clásico de este setup.
5. **GitHub Pages → Enforce HTTPS**, una vez que el dominio propague (puede tardar unas horas).

---

## Después de publicar

- [ ] **Google Search Console** — verificar el dominio y enviar `sitemap.xml`. Sin esto, Google tarda semanas en indexar.
- [ ] **Perfil de Empresa de Google** — gratis, y es lo que los hace aparecer en Maps y en el panel lateral al buscar "protectora Luján". Para búsqueda local pesa más que la web misma.
- [ ] Poner `lujaneritos.com.ar` en la bio de Instagram, Facebook y TikTok.
- [ ] Pedirle a [LujánHoy](https://www.lujanhoy.com.ar/) que enlace la web en sus notas.
- [ ] Validar el JSON-LD en la Prueba de Resultados Enriquecidos de Google.
- [ ] Probar una donación real de $100 de punta a punta, escaneando el QR desde un teléfono.
- [ ] **Google Ad Grants** — US$10.000/mes en Google Ads gratis para ONGs con personería jurídica. En Argentina se valida vía TechSoup/Wingu.

---

## Una regla

**Ningún dato inventado.** Cifras de rescatados, costos de una vacuna, cantidad de adoptados: todo confirmado por la organización o no va. Es una ONG que pide plata; un número falso les rompe la credibilidad.

---

Hecho sin costo para Lujaneritos. 🐾
