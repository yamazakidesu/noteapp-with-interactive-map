export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Tambahkan di index.js atau file inisialisasi utama

// Setup skip to content
const setupSkipToContent = () => {
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.querySelector('#main-content');

  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Set fokus ke main content
      mainContent.focus();
      
      // Scroll ke main content (smooth)
      mainContent.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
};

// Panggil saat DOM ready
document.addEventListener('DOMContentLoaded', setupSkipToContent);

// Export jika menggunakan module
export default setupSkipToContent;