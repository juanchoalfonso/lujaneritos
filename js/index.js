/* =========================================================
   LUJANERITOS — scripts del sitio
   =========================================================
   TODO:DATO — todo lo configurable vive acá arriba.
   Cambiá estos valores y el resto del sitio se acomoda solo.
   ========================================================= */

const CONFIG = {
    /* Número de WhatsApp en formato internacional, sin + ni espacios.
       +54 9 2323 53-8038 */
    WHATSAPP: '5492323538038',
};

/* ---------------------------------------------------------
   NAV — menú mobile y sombra al scrollear
   --------------------------------------------------------- */
function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('nav-burger');
    const links = document.getElementById('nav-links');
    if (!nav || !burger || !links) return;

    burger.addEventListener('click', () => {
        const abierto = links.classList.toggle('abierto');
        burger.setAttribute('aria-expanded', String(abierto));
        burger.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

    // Al tocar un link del menú, cerrarlo
    links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
            links.classList.remove('abierto');
            burger.setAttribute('aria-expanded', 'false');
            burger.setAttribute('aria-label', 'Abrir menú');
        });
    });

    const alScrollear = () => nav.classList.toggle('scrolleado', window.scrollY > 12);
    alScrollear();
    window.addEventListener('scroll', alScrollear, { passive: true });
}

/* ---------------------------------------------------------
   COPIAR ALIAS
   --------------------------------------------------------- */

/* Intenta la API moderna y, si falla (permisos, documento sin foco,
   navegador viejo), cae al método clásico. Devuelve true si copió. */
async function copiarTexto(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(texto);
            return true;
        } catch (e) {
            /* seguimos con el fallback */
        }
    }

    try {
        const tmp = document.createElement('textarea');
        tmp.value = texto;
        tmp.setAttribute('readonly', '');
        tmp.style.position = 'fixed';
        tmp.style.top = '0';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        tmp.setSelectionRange(0, texto.length); // iOS lo necesita
        const ok = document.execCommand('copy');
        document.body.removeChild(tmp);
        return ok;
    } catch (e) {
        return false;
    }
}

/* Deja el texto de un elemento seleccionado, para copiar a mano */
function seleccionar(el) {
    try {
        const rango = document.createRange();
        rango.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(rango);
    } catch (e) {
        /* no pasa nada */
    }
}

function initCopiar() {
    document.querySelectorAll('[data-copiar]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const origen = document.querySelector(btn.dataset.copiar);
            if (!origen) return;

            const texto = origen.textContent.trim();
            const original = btn.textContent;

            if (await copiarTexto(texto)) {
                btn.textContent = '¡Copiado!';
                btn.classList.add('copiado');
            } else {
                // Último recurso: dejamos el alias seleccionado para que lo copie a mano
                btn.textContent = 'Copialo vos';
                seleccionar(origen);
            }

            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('copiado');
            }, 2200);
        });
    });
}

/* ---------------------------------------------------------
   WHATSAPP — arma los links desde CONFIG.WHATSAPP
   --------------------------------------------------------- */
function initWhatsApp() {
    document.querySelectorAll('.js-wa').forEach((el) => {
        const msg = el.dataset.waMsg || 'Hola!';
        el.setAttribute('href', `https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(msg)}`);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
    });
}

/* ---------------------------------------------------------
   ANIMACIÓN AL SCROLL
   --------------------------------------------------------- */
function initRevelar() {
    const objetivos = document.querySelectorAll(
        '.tarjeta, .card, .historia, .ayuda, .monto, .cita, .faq__item, .destino, .figurita'
    );
    if (!objetivos.length) return;

    // Sin IntersectionObserver, mostramos todo sin animar
    if (!('IntersectionObserver' in window)) return;

    objetivos.forEach((el) => el.classList.add('revelar'));

    const obs = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    objetivos.forEach((el) => obs.observe(el));
}

/* ---------------------------------------------------------
   LIGHTBOX — ver las fotos a pantalla completa
   Toma las fotos de las historias, el plantel y los productos.
   Se cierra con la X, con Escape, o tocando fuera de la imagen.
   --------------------------------------------------------- */
function initLightbox() {
    const caja = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const pie = document.getElementById('lightbox-pie');
    const btnCerrar = document.getElementById('lightbox-cerrar');
    const btnPrev = document.getElementById('lightbox-prev');
    const btnNext = document.getElementById('lightbox-next');
    if (!caja || !img) return;

    // Las figuritas del plantel no entran: son links a WhatsApp
    const fotos = [...document.querySelectorAll(
        '.caso__foto img, .ayuda__fotos img, .nosotros__foto img'
    )];
    if (!fotos.length) return;

    let actual = 0;
    let veniaDe = null;

    const mostrar = (i) => {
        actual = (i + fotos.length) % fotos.length;
        const f = fotos[actual];
        img.src = f.currentSrc || f.src;
        img.alt = f.alt || '';
        pie.textContent = f.alt || '';
        // Con una sola foto no tiene sentido mostrar las flechas
        const varias = fotos.length > 1;
        btnPrev.hidden = !varias;
        btnNext.hidden = !varias;
    };

    const abrir = (i, origen) => {
        veniaDe = origen;
        mostrar(i);
        caja.hidden = false;
        document.body.style.overflow = 'hidden';
        btnCerrar.focus();
    };

    const cerrar = () => {
        caja.hidden = true;
        // removeAttribute y no src='': con src vacío el navegador
        // pide la página actual como si fuera una imagen
        img.removeAttribute('src');
        document.body.style.overflow = '';
        if (veniaDe) veniaDe.focus();
    };

    fotos.forEach((f, i) => {
        f.classList.add('ampliable');
        // Accesible con teclado, no sólo con el mouse
        f.setAttribute('tabindex', '0');
        f.setAttribute('role', 'button');
        f.setAttribute('aria-label', `Ampliar foto: ${f.alt || 'sin descripción'}`);
        f.addEventListener('click', () => abrir(i, f));
        f.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrir(i, f);
            }
        });
    });

    btnCerrar.addEventListener('click', cerrar);
    btnPrev.addEventListener('click', () => mostrar(actual - 1));
    btnNext.addEventListener('click', () => mostrar(actual + 1));

    // Tocar el fondo cierra; tocar la imagen no
    caja.addEventListener('click', (e) => {
        if (e.target === caja || e.target.classList.contains('lightbox__figura')) cerrar();
    });

    document.addEventListener('keydown', (e) => {
        if (caja.hidden) return;
        if (e.key === 'Escape') cerrar();
        if (e.key === 'ArrowLeft') mostrar(actual - 1);
        if (e.key === 'ArrowRight') mostrar(actual + 1);
    });
}

/* ---------------------------------------------------------
   Año del footer
   --------------------------------------------------------- */
function initAnio() {
    const el = document.getElementById('anio');
    if (el) el.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initCopiar();
    initWhatsApp();
    initRevelar();
    initLightbox();
    initAnio();
});
