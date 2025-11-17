import { getStories } from '../../data/api.js';
import CONFIG from '../../config.js';
import indexedDBManager from '../../data/indexeddb.js';

export default class HomePage {
  constructor() {
    this.currentPage = 1;
  }

  async render() {
    return `
      <section class="container">
        <h1>Berbagi Cerita</h1>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <a href="#/add" class="add-btn">Tambah Cerita Baru</a>
          <a href="#/favorites" class="favorites-btn">Cerita Favorit</a>
        </div>
        <div id="loading" style="display: none;">Loading...</div>
        <div id="stories-list"></div>
        <div id="pagination" style="margin: 20px 0;">
          <button id="prev-btn" disabled>Previous</button>
          <span id="page-info">Page 1</span>
          <button id="next-btn">Next</button>
        </div>
        <div id="map" style="height: 400px; width: 100%; margin-top: 20px;"></div>
      </section>
    `;
  }

  async afterRender() {
    this.initMap();
    this.loadStories();
    this.setupPagination();
  }

  initMap() {
    const mapElement = document.getElementById('map');
    const map = L.map(mapElement).setView([-6.2, 106.816666], 10);

    const streets = L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAP_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    const satellite = L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.png?key=${CONFIG.MAP_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    const baseLayers = {
      'Streets': streets,
      'Satellite': satellite,
    };

    streets.addTo(map);
    L.control.layers(baseLayers).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          map.setView([lat, lng], 15);
          L.marker([lat, lng]).addTo(map).bindPopup('Your Location').openPopup();
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }

    this.map = map;
  }

  async loadStories() {
    const loading = document.getElementById('loading');
    const list = document.getElementById('stories-list');
    loading.style.display = 'block';
    list.innerHTML = '';
    try {
      const data = await getStories({ page: this.currentPage });
      const stories = data.listStory || [];
      await this.renderStories(stories);
      this.addMarkers(stories);
      this.setupStoryInteractions(stories);
      this.updatePagination(data);
    } catch (error) {
      if (!localStorage.getItem('token')) {
        list.innerHTML = '<p>Login to view stories.</p>';
      } else {
        list.innerHTML = `<p>Error loading stories: ${error.message}</p>`;
      }
    } finally {
      loading.style.display = 'none';
    }
  }

  async renderStories(stories) {
    const list = document.getElementById('stories-list');
    
    // Check favorite status for each story
    const storiesWithFavoriteStatus = await Promise.all(
      stories.map(async (story) => {
        const isFavorite = await indexedDBManager.isFavorite(story.id);
        return { ...story, isFavorite };
      })
    );

    list.innerHTML = storiesWithFavoriteStatus.map(story => `
      <div class="story-item" data-id="${story.id}">
        <a href="#/story/${story.id}">
          <img src="${story.photoUrl}" alt="${story.name || 'Story'}" style="width: 100px; height: 100px;">
        </a>
        <h3><a href="#/story/${story.id}">${story.name || 'Untitled'}</a></h3>
        <p>${story.description}</p>
        <p>Created: ${new Date(story.createdAt).toLocaleDateString()}</p>
        <button class="favorite-btn" data-id="${story.id}" style="
          background: ${story.isFavorite ? '#ff4444' : '#4CAF50'};
          color: white;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          border-radius: 4px;
          margin-top: 10px;
        ">
          ${story.isFavorite ? '❤️ Hapus dari Favorit' : '🤍 Tambah ke Favorit'}
        </button>
      </div>
    `).join('');

    // Setup favorite button listeners
    this.setupFavoriteButtons(storiesWithFavoriteStatus);
  }

  setupFavoriteButtons(stories) {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const storyId = btn.dataset.id;
        const story = stories.find(s => s.id === storyId);
        
        try {
          const isFavorite = await indexedDBManager.isFavorite(storyId);
          
          if (isFavorite) {
            await indexedDBManager.deleteFavorite(storyId);
            btn.style.background = '#4CAF50';
            btn.innerHTML = '🤍 Tambah ke Favorit';
            alert('Cerita dihapus dari favorit!');
          } else {
            await indexedDBManager.addFavorite(story);
            btn.style.background = '#ff4444';
            btn.innerHTML = '❤️ Hapus dari Favorit';
            alert('Cerita ditambahkan ke favorit!');
          }
        } catch (error) {
          console.error('Error toggling favorite:', error);
          alert('Gagal memperbarui favorit');
        }
      });
    });
  }

  addMarkers(stories) {
    if (!this.map) return;
    this.markers = [];
    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this.map);
        marker.id = story.id;
        marker.bindPopup(`
          <div>
            <img src="${story.photoUrl}" alt="${story.name}" style="width: 100px;">
            <h4>${story.name}</h4>
            <p>${story.description}</p>
          </div>
        `);
        this.markers.push(marker);
      }
    });
  }

  setupPagination() {
    document.getElementById('prev-btn').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.loadStories();
      }
    });
    document.getElementById('next-btn').addEventListener('click', () => {
      this.currentPage++;
      this.loadStories();
    });
  }

  updatePagination(data) {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    prevBtn.disabled = this.currentPage === 1;
    nextBtn.disabled = (data.listStory || []).length < 10;
    pageInfo.textContent = `Page ${this.currentPage}`;
  }

  setupStoryInteractions(stories) {
    document.querySelectorAll('.story-item').forEach(item => {
      item.removeEventListener('mouseenter', item._storyMouseEnter);
      item.removeEventListener('mouseleave', item._storyMouseLeave);
      item._storyMouseEnter = null;
      item._storyMouseLeave = null;
    });

    document.querySelectorAll('.story-item').forEach(item => {
      const id = item.dataset.id;
      const marker = this.markers.find(m => m.id === id);

      if (marker) {
        item._storyMouseEnter = () => {
          marker.openPopup();
        };
        item._storyMouseLeave = () => {
          marker.closePopup();
        };

        item.addEventListener('mouseenter', item._storyMouseEnter);
        item.addEventListener('mouseleave', item._storyMouseLeave);
      }
    });

    this.markers.forEach(marker => {
      marker.off('click');
      marker.on('click', () => {
        window.location.hash = `#/story/${marker.id}`;
      });
    });
  }
}