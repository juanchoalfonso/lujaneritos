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

    /* Poner en true cuando la organización confirme que quiere la sección
       de adoptables, y cargar los animales en /data/adoptables.json */
    ADOPTABLES_ACTIVO: false,
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
   MONTOS SUGERIDOS
   Sin links de pago de MercadoPago, lo más útil que puede hacer
   el botón es copiar el alias y recordar cuánto transferir.
   Si algún día hay links, basta con ponerle data-link a cada uno.
   --------------------------------------------------------- */
function initMontos() {
    const botones = document.querySelectorAll('.monto');
    const aviso = document.getElementById('montos-aviso');
    if (!botones.length) return;

    const alias = document.getElementById('alias-valor');
    const avisoOriginal = aviso ? aviso.textContent : '';
    let volver;

    botones.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const link = btn.dataset.link;
            if (link) {
                window.open(link, '_blank', 'noopener');
                return;
            }

            if (!alias || !aviso) return;

            const monto = Number(btn.dataset.monto).toLocaleString('es-AR');
            const ok = await copiarTexto(alias.textContent.trim());

            aviso.textContent = ok
                ? `Alias copiado. Transferí $${monto} a ${alias.textContent.trim()}. ¡Gracias!`
                : `Transferí $${monto} al alias ${alias.textContent.trim()}. ¡Gracias!`;
            aviso.classList.add('montos__nota--activa');

            clearTimeout(volver);
            volver = setTimeout(() => {
                aviso.textContent = avisoOriginal;
                aviso.classList.remove('montos__nota--activa');
            }, 6000);
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
        '.tarjeta, .card, .historia, .ayuda, .monto, .cita, .faq__item'
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
   ADOPTABLES — apagado por flag hasta que lo confirmen
   --------------------------------------------------------- */
async function initAdoptables() {
    const seccion = document.getElementById('adoptar');
    const redes = document.getElementById('adoptar-redes');
    const grid = document.getElementById('adoptar-grid');
    if (!seccion || !grid) return;

    if (!CONFIG.ADOPTABLES_ACTIVO) return; // queda oculta y se muestra el bloque de redes

    try {
        const res = await fetch('/data/adoptables.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(res.status);
        const animales = await res.json();
        if (!Array.isArray(animales) || !animales.length) return;

        grid.innerHTML = animales
            .map(
                (a) => `
        <article class="adoptable">
          <img src="${a.foto}" alt="${a.nombre}, en adopción" loading="lazy" width="400" height="400">
          <div class="adoptable__cuerpo">
            <h3>${a.nombre}</h3>
            <p class="adoptable__datos">${[a.edad, a.tamano, a.sexo].filter(Boolean).join(' · ')}</p>
            <p>${a.descripcion || ''}</p>
            <a class="btn btn--secundario js-wa" data-wa-msg="Hola! Quiero saber más sobre ${a.nombre}">Quiero conocerlo</a>
          </div>
        </article>`
            )
            .join('');

        seccion.hidden = false;
        if (redes) redes.hidden = true;

        initWhatsApp(); // los botones recién creados también necesitan su href
    } catch (e) {
        // Si falla, la sección simplemente no aparece y queda el bloque de redes
        console.warn('No se pudieron cargar los adoptables:', e);
    }
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
    initMontos();
    initWhatsApp();
    initRevelar();
    initAnio();
    initAdoptables();
});
