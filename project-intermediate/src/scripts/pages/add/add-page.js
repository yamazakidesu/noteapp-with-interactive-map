import { addStory, addStoryGuest } from '../../data/api.js';
import CONFIG from '../../config.js';

export default class AddPage {
  #photoDataUrl = null;

  async render() {
    return `
      <section class="container">
        <h1>Tambah Cerita Baru</h1>
        <form id="add-form" class="form">
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" name="description" required></textarea>
          </div>
          <div class="form-group">
            <label for="photo">Photo:</label>
            <input type="file" id="photo" name="photo" accept="image/*" required>
            <button type="button" id="camera-btn">Use Camera</button>
            <video id="video" autoplay style="display:none; width:100%; max-width:400px; margin-top:10px;"></video>
            <canvas id="canvas" style="display:none; width:100%; max-width:400px; margin-top:10px;"></canvas>
            <button type="button" id="capture-btn" style="display:none; margin-top:10px;">Capture</button>
            <button type="button" id="retake-btn" style="display:none; margin-top:10px;">Retake</button>
          </div>
          <div class="form-group">
            <div id="map" style="height: 300px; width: 100%;"></div>
            <p>Click on the map to set location.</p>
            <input type="hidden" id="lat" name="lat">
            <input type="hidden" id="lon" name="lon">
          </div>
          <div class="form-group">
            <button type="submit">Add Story</button>
          </div>
        </form>
        <div id="message"></div>
      </section>
    `;
  }

  async afterRender() {
    this.initMap();
    this.setupForm();
  }

  initMap() {
    const mapElement = document.getElementById('map');
    const map = L.map(mapElement).setView([-6.2, 106.816666], 10);

    L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${CONFIG.MAP_API_KEY}`, {
      attribution: '&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    let currentMarker = null;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          map.setView([lat, lng], 15);
          currentMarker = L.marker([lat, lng]).addTo(map).bindPopup('Your Location').openPopup();
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }

    map.on('click', (event) => {
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }
      document.getElementById('lat').value = event.latlng.lat;
      document.getElementById('lon').value = event.latlng.lng;
      currentMarker = L.marker([event.latlng.lat, event.latlng.lng]).addTo(map);
    });
  }

  setupForm() {
    const form = document.getElementById('add-form');
    const cameraBtn = document.getElementById('camera-btn');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const photoInput = document.getElementById('photo');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const messageDiv = document.getElementById('message');
    let stream;

    photoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.#photoDataUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    cameraBtn.addEventListener('click', async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        cameraBtn.style.display = 'none';
      } catch (error) {
        messageDiv.textContent = 'Camera access denied.';
      }
    });

    captureBtn.addEventListener('click', () => {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        photoInput.files = dataTransfer.files;
        this.#photoDataUrl = canvas.toDataURL('image/jpeg');
        canvas.style.display = 'block';
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'inline-block';
      });
    });

    retakeBtn.addEventListener('click', () => {
      canvas.style.display = 'none';
      video.style.display = 'block';
      captureBtn.style.display = 'inline-block';
      retakeBtn.style.display = 'none';
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const description = document.getElementById('description').value;
      const photo = document.getElementById('photo').files[0];
      const latValue = document.getElementById('lat').value;
      const lonValue = document.getElementById('lon').value;
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('description', description);
        formData.append('photo', photo);
        formData.append('lat', latValue || '0');
        formData.append('lon', lonValue || '0');
        
        let result;
        if (token) {
          result = await addStory(formData);
        } else {
          result = await addStoryGuest(formData);
        }
        
        messageDiv.textContent = 'Story added successfully!';
        
        // Bersihkan form
        form.reset();
        if (this.map) {
          this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
              this.map.removeLayer(layer);
            }
          });
        }
        this.#photoDataUrl = null;
        canvas.style.display = 'none';
        retakeBtn.style.display = 'none';
        cameraBtn.style.display = 'inline-block';
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        // ✨ TAMBAHAN: Navigasi ke home setelah 1 detik
        setTimeout(() => {
          window.location.hash = '#/home';
        }, 1000);
        
      } catch (error) {
        messageDiv.textContent = `Error: ${error.message}`;
      }
    });
  }
}