// ============================================================
// MOUNT MEDIA — atmospheric canvas, hero reveal, scroll effects
// ============================================================

(function () {

    // ── THEME TOGGLE ──────────────────────────────────────────
    var root   = document.documentElement;
    var toggle = document.getElementById('themeToggle');

    if (toggle) {
        toggle.addEventListener('click', function () {
            var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('ingrid-theme', next); } catch (e) {}
        });
    }

    // ── SCROLL: sticky header ─────────────────────────────────
    var header = document.getElementById('siteHeader');
    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    // ── HERO ENTRANCE ─────────────────────────────────────────
    function animateHero() {
        var els = [
            { id: 'heroEyebrow', delay: 300 },
            { id: 'heroTitle',   delay: 500 },
            { id: 'heroSub',     delay: 750 },
            { id: 'heroScroll',  delay: 1050 }
        ];
        els.forEach(function (item) {
            var el = document.getElementById(item.id);
            if (!el) return;
            setTimeout(function () {
                el.style.transition = 'opacity .9s ease, transform .9s ease';
                el.style.opacity    = '1';
                el.style.transform  = 'translateY(0)';
            }, item.delay);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateHero);
    } else {
        animateHero();
    }

    // ── SCROLL REVEAL ─────────────────────────────────────────
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        var obs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });

        revealEls.forEach(function (el) { obs.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    // ── ATMOSPHERIC CANVAS ────────────────────────────────────
    var canvas  = document.getElementById('mm-canvas');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var W, H, dpr;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Particle types: fog blobs + small drifting dots
    var particles = [];
    var fogLayers  = [];

    function rand(a, b) { return a + Math.random() * (b - a); }

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W   = window.innerWidth;
        H   = window.innerHeight;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        init();
    }

    function init() {
        particles = [];
        fogLayers = [];

        // Drifting star-like particles
        var count = Math.max(20, Math.min(55, Math.floor(W / 28)));
        for (var i = 0; i < count; i++) {
            particles.push({
                x:   rand(0, W),
                y:   rand(0, H),
                vx:  rand(-0.12, 0.12),
                vy:  rand(-0.08, 0.08),
                r:   rand(0.4, 1.8),
                a:   rand(0.15, 0.55),
                // connection colour: gold or fjord-blue
                hue: Math.random() < 0.35 ? 'gold' : 'blue'
            });
        }

        // Slow fog blobs
        var fogCount = Math.max(4, Math.min(9, Math.floor(W / 200)));
        for (var j = 0; j < fogCount; j++) {
            fogLayers.push({
                x:   rand(0, W),
                y:   rand(H * 0.1, H * 0.7),
                rx:  rand(180, 420),
                ry:  rand(80, 220),
                a:   rand(0.018, 0.042),
                vx:  rand(-0.06, 0.06),
                vy:  rand(-0.025, 0.025)
            });
        }
    }

    function drawFrame() {
        ctx.clearRect(0, 0, W, H);

        // -- fog blobs --
        fogLayers.forEach(function (f) {
            if (!reduced) {
                f.x += f.vx;
                f.y += f.vy;
                if (f.x < -f.rx * 2) f.x = W + f.rx;
                if (f.x > W + f.rx * 2) f.x = -f.rx;
                if (f.y < -f.ry * 2) f.y = H + f.ry;
                if (f.y > H + f.ry * 2) f.y = -f.ry;
            }
            var grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, Math.max(f.rx, f.ry));
            grd.addColorStop(0,   'rgba(196,151,42,' + f.a + ')');
            grd.addColorStop(0.5, 'rgba(15, 40, 90,' + (f.a * 0.6) + ')');
            grd.addColorStop(1,   'rgba(8,14,26,0)');
            ctx.save();
            ctx.scale(f.rx / Math.max(f.rx, f.ry), f.ry / Math.max(f.rx, f.ry));
            ctx.beginPath();
            ctx.arc(
                f.x * Math.max(f.rx, f.ry) / f.rx,
                f.y * Math.max(f.rx, f.ry) / f.ry,
                Math.max(f.rx, f.ry), 0, Math.PI * 2
            );
            ctx.fillStyle = grd;
            ctx.fill();
            ctx.restore();
        });

        // -- particles & connections --
        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            if (!reduced) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -10) p.x = W + 10;
                if (p.x > W + 10) p.x = -10;
                if (p.y < -10) p.y = H + 10;
                if (p.y > H + 10) p.y = -10;
            }

            for (var j = i + 1; j < particles.length; j++) {
                var q  = particles[j];
                var dx = p.x - q.x;
                var dy = p.y - q.y;
                var d  = Math.sqrt(dx * dx + dy * dy);
                if (d < 160) {
                    var alpha = (1 - d / 160) * 0.07;
                    var colour = p.hue === 'gold'
                        ? 'rgba(196,151,42,' + alpha + ')'
                        : 'rgba(80,130,200,' + alpha + ')';
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.strokeStyle = colour;
                    ctx.lineWidth   = 0.5;
                    ctx.stroke();
                }
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.hue === 'gold'
                ? 'rgba(220,175,80,' + p.a + ')'
                : 'rgba(160,200,255,' + p.a + ')';
            ctx.fill();
        }

        if (!reduced) requestAnimationFrame(drawFrame);
    }

    resize();
    drawFrame();
    window.addEventListener('resize', resize);

})();

