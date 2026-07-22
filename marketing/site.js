const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.textContent = open ? 'Close' : 'Menu';
  });

  mobileMenu.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    mobileMenu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = 'Menu';
  });
}

const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.style.boxShadow = window.scrollY > 40
    ? '0 16px 45px rgba(13,43,36,.14)'
    : '0 12px 35px rgba(13,43,36,.08)';
}, { passive: true });
