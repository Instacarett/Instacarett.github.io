/* Keep floating navigation readable against the section beneath it. */
(() => {
    const nav = document.querySelector('.desktop_nav_container');
    if (!nav) return;
    let pending = false;
    function luminance(color) {
        const channels = color.match(/[\d.]+/g);
        if (!channels || channels.length < 3) return null;
        if (channels.length > 3 && Number(channels[3]) < 0.5) return null;
        return channels.slice(0, 3).map(Number).map(v => {
            v /= 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
        }).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
    }
    function update() {
        pending = false;
        const bar = nav.querySelector('.desktop_nav');
        const toggle = nav.querySelector('.mobile_nav_toggle');
        const target = getComputedStyle(bar).display === 'none' ? toggle : bar;
        const overlays = [{ root: nav, target }];
        const drawer = nav.querySelector('.mobile_nav_menu.is-open');
        if (drawer) overlays.push({ root: drawer, target: drawer });
        const banner = document.querySelector('.cookie_banner:not([hidden])');
        if (banner) overlays.push({ root: banner, target: banner });
        overlays.forEach(({ root, target }) => {
            const rect = target.getBoundingClientRect();
            const x = Math.min(innerWidth - 1, Math.max(0, rect.left + rect.width / 2));
            const y = Math.min(innerHeight - 1, Math.max(0, rect.top + rect.height / 2));
            const underneath = document.elementsFromPoint(x, y).find(el =>
                !el.closest('.desktop_nav_container, .cookie_banner'));
            let light = 1;
            for (let el = underneath; el; el = el.parentElement) {
                const value = luminance(getComputedStyle(el).backgroundColor);
                if (value !== null) { light = value; break; }
            }
            root.dataset.contrast = light < 0.35 ? 'light' : 'dark';
        });
    }
    function schedule() {
        if (!pending) { pending = true; requestAnimationFrame(update); }
    }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    addEventListener('load', schedule);
    addEventListener('overlay-contrast-update', schedule);
    const drawer = nav.querySelector('.mobile_nav_menu');
    if (drawer) new MutationObserver(schedule).observe(drawer, { attributes: true, attributeFilter: ['class'] });
    const banner = document.querySelector('.cookie_banner');
    if (banner && 'ResizeObserver' in window) new ResizeObserver(schedule).observe(banner);
    update();
})();
