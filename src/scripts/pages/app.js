import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    // ❌ HAPUS initPWA() karena sudah ada di src/index.js
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const token = localStorage.getItem('token');

    // Validasi authentication
    if (!token && url !== '/register' && url !== '/login' && url !== '/add' && url !== '/' && !url.startsWith('/story/') && url !== '/favorites') {
      window.location.hash = '/login';
      return;
    }

    const page = routes[url];

    if (!page) {
      this.#content.innerHTML = '<h1>Page not found</h1>';
      return;
    }

    // Gunakan View Transition API
    if (!document.startViewTransition) {
      // Fallback untuk browser yang tidak support View Transition API
      await this.#renderPageContent(page);
    } else {
      // Gunakan View Transition API
      const transition = document.startViewTransition(async () => {
        await this.#renderPageContent(page);
      });

      // Optional: Handle transition finished
      try {
        await transition.finished;
      } catch (error) {
        console.error('Transition error:', error);
      }
    }
  }

  async #renderPageContent(page) {
    // Render konten halaman
    this.#content.innerHTML = await page.render();
    
    // Jalankan after render (untuk inisialisasi event listeners, dll)
    await page.afterRender();
    
    // Scroll ke atas setelah render
    window.scrollTo(0, 0);
  }
}

export default App;