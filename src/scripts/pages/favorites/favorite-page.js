import indexedDBManager from '../../data/indexeddb';

export default class FavoritesPage {
  async render() {
    return `
      <section class="container">
        <h1>Cerita Favorit Saya</h1>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <a href="#/" class="back-btn">← Kembali</a>
          <button id="clear-all-btn" class="clear-btn" style="
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            border-radius: 4px;
          ">Hapus Semua Favorit</button>
        </div>
        <div id="favorites-list"></div>
      </section>
    `;
  }

  async afterRender() {
    await this.loadFavorites();
    this.setupClearAllButton();
  }

  async loadFavorites() {
    const list = document.getElementById('favorites-list');
    
    try {
      const favorites = await indexedDBManager.getAllFavorites();
      
      if (favorites.length === 0) {
        list.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <p style="font-size: 18px; color: #666;">Belum ada cerita favorit</p>
            <a href="#/" style="
              display: inline-block;
              margin-top: 20px;
              padding: 10px 20px;
              background: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 4px;
            ">Jelajahi Cerita</a>
          </div>
        `;
        return;
      }

      list.innerHTML = favorites.map(story => `
        <div class="story-item" data-id="${story.id}">
          <a href="#/story/${story.id}">
            <img src="${story.photoUrl}" alt="${story.name || 'Story'}" style="width: 100px; height: 100px;">
          </a>
          <h3><a href="#/story/${story.id}">${story.name || 'Untitled'}</a></h3>
          <p>${story.description}</p>
          <p>Created: ${new Date(story.createdAt).toLocaleDateString()}</p>
          <p style="font-size: 12px; color: #666;">Disimpan: ${new Date(story.savedAt).toLocaleDateString()}</p>
          <button class="delete-favorite-btn" data-id="${story.id}" style="
            background: #ff4444;
            color: white;
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            border-radius: 4px;
            margin-top: 10px;
          ">
            🗑️ Hapus dari Favorit
          </button>
        </div>
      `).join('');

      this.setupDeleteButtons();
    } catch (error) {
      console.error('Error loading favorites:', error);
      list.innerHTML = '<p>Error loading favorites</p>';
    }
  }

  setupDeleteButtons() {
    document.querySelectorAll('.delete-favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const storyId = btn.dataset.id;
        
        if (confirm('Hapus cerita ini dari favorit?')) {
          try {
            await indexedDBManager.deleteFavorite(storyId);
            alert('Cerita dihapus dari favorit!');
            await this.loadFavorites();
          } catch (error) {
            console.error('Error deleting favorite:', error);
            alert('Gagal menghapus favorit');
          }
        }
      });
    });
  }

  setupClearAllButton() {
    const clearBtn = document.getElementById('clear-all-btn');
    clearBtn.addEventListener('click', async () => {
      if (confirm('Hapus semua cerita favorit? Tindakan ini tidak dapat dibatalkan!')) {
        try {
          await indexedDBManager.clearAllFavorites();
          alert('Semua favorit telah dihapus!');
          await this.loadFavorites();
        } catch (error) {
          console.error('Error clearing favorites:', error);
          alert('Gagal menghapus semua favorit');
        }
      }
    });
  }
}