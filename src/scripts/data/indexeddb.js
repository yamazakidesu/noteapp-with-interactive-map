class IndexedDBManager {
  constructor() {
    this.dbName = 'BerbagiCeritaDB';
    this.version = 1;
    this.db = null;
  }

  async openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store for favorite stories
        if (!db.objectStoreNames.contains('favorites')) {
          const objectStore = db.createObjectStore('favorites', { keyPath: 'id' });
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async addFavorite(story) {
    try {
      if (!this.db) {
        await this.openDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const objectStore = transaction.objectStore('favorites');
        
        const favoriteStory = {
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          lat: story.lat,
          lon: story.lon,
          savedAt: new Date().toISOString()
        };

        const request = objectStore.add(favoriteStory);

        request.onsuccess = () => {
          resolve(favoriteStory);
        };

        request.onerror = () => {
          reject(new Error('Failed to add favorite'));
        };
      });
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }

  async getAllFavorites() {
    try {
      if (!this.db) {
        await this.openDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const objectStore = transaction.objectStore('favorites');
        const request = objectStore.getAll();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error('Failed to get favorites'));
        };
      });
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  }

  async getFavorite(id) {
    try {
      if (!this.db) {
        await this.openDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readonly');
        const objectStore = transaction.objectStore('favorites');
        const request = objectStore.get(id);

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(new Error('Failed to get favorite'));
        };
      });
    } catch (error) {
      console.error('Error getting favorite:', error);
      throw error;
    }
  }

  async deleteFavorite(id) {
    try {
      if (!this.db) {
        await this.openDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const objectStore = transaction.objectStore('favorites');
        const request = objectStore.delete(id);

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          reject(new Error('Failed to delete favorite'));
        };
      });
    } catch (error) {
      console.error('Error deleting favorite:', error);
      throw error;
    }
  }

  async isFavorite(id) {
    try {
      const favorite = await this.getFavorite(id);
      return !!favorite;
    } catch (error) {
      return false;
    }
  }

  async clearAllFavorites() {
    try {
      if (!this.db) {
        await this.openDB();
      }

      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['favorites'], 'readwrite');
        const objectStore = transaction.objectStore('favorites');
        const request = objectStore.clear();

        request.onsuccess = () => {
          resolve(true);
        };

        request.onerror = () => {
          reject(new Error('Failed to clear favorites'));
        };
      });
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw error;
    }
  }
}

export default new IndexedDBManager();