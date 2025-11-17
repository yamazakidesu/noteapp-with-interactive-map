(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))o(r);new MutationObserver(r=>{for(const n of r)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function e(r){const n={};return r.integrity&&(n.integrity=r.integrity),r.referrerPolicy&&(n.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?n.credentials="include":r.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(r){if(r.ep)return;r.ep=!0;const n=e(r);fetch(r.href,n)}})();const l={BASE_URL:"https://story-api.dicoding.dev/v1",MAP_API_KEY:"LnQ11cZ5RC22Jy5wgsdH",VAPID_PUBLIC_KEY:"BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"},p={REGISTER:`${l.BASE_URL}/register`,LOGIN:`${l.BASE_URL}/login`,STORIES:`${l.BASE_URL}/stories`,GUEST_STORIES:`${l.BASE_URL}/stories/guest`,SUBSCRIBE_PUSH:`${l.BASE_URL}/notifications/subscribe`};async function P({name:i,email:t,password:e}){const o=await fetch(p.REGISTER,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:i,email:t,password:e})}),r=await o.json();if(!o.ok)throw new Error(r.message||"Failed to register");return r}async function x({email:i,password:t}){const e=await fetch(p.LOGIN,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:i,password:t})}),o=await e.json();if(!e.ok)throw new Error(o.message||"Failed to login");return o}async function A({page:i=1,size:t=10,location:e=0}={}){const o=localStorage.getItem("token"),r=new URLSearchParams({page:i.toString(),size:t.toString(),location:e.toString()}),n=`${p.STORIES}?${r}`,a={"Content-Type":"application/json"};o&&(a.Authorization=`Bearer ${o}`);const s=await fetch(n,{headers:a}),c=await s.json();if(!s.ok)throw new Error(c.message||"Failed to fetch stories");return c}async function T(i){const t=localStorage.getItem("token"),e={"Content-Type":"application/json"};t&&(e.Authorization=`Bearer ${t}`);const o=await fetch(`${p.STORIES}/${i}`,{headers:e}),r=await o.json();if(!o.ok)throw new Error(r.message||"Failed to fetch story detail");return r}async function F(i){const t=localStorage.getItem("token")||l.TOKEN,e=await fetch(p.STORIES,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i}),o=await e.json();if(!e.ok)throw new Error(o.message||"Failed to add story");return o}async function C(i){const t=await fetch(p.GUEST_STORIES,{method:"POST",body:i}),e=await t.json();if(!t.ok)throw new Error(e.message||"Failed to add story as guest");return e}async function M(i){const t=localStorage.getItem("token")||l.TOKEN,e=await fetch(p.SUBSCRIBE_PUSH,{method:"POST",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify(i)}),o=await e.json();if(!e.ok)throw new Error(o.message||"Failed to subscribe push");return o}async function $(i){const t=localStorage.getItem("token")||l.TOKEN,e=await fetch(p.SUBSCRIBE_PUSH,{method:"DELETE",headers:{Authorization:`Bearer ${t}`,"Content-Type":"application/json"},body:JSON.stringify({endpoint:i})}),o=await e.json();if(!e.ok)throw new Error(o.message||"Failed to unsubscribe push");return o}class D{constructor(){this.dbName="BerbagiCeritaDB",this.version=1,this.db=null}async openDB(){return new Promise((t,e)=>{const o=indexedDB.open(this.dbName,this.version);o.onerror=()=>{e(new Error("Failed to open database"))},o.onsuccess=()=>{this.db=o.result,t(this.db)},o.onupgradeneeded=r=>{const n=r.target.result;if(!n.objectStoreNames.contains("favorites")){const a=n.createObjectStore("favorites",{keyPath:"id"});a.createIndex("name","name",{unique:!1}),a.createIndex("createdAt","createdAt",{unique:!1})}}})}async addFavorite(t){try{return this.db||await this.openDB(),new Promise((e,o)=>{const n=this.db.transaction(["favorites"],"readwrite").objectStore("favorites"),a={id:t.id,name:t.name,description:t.description,photoUrl:t.photoUrl,createdAt:t.createdAt,lat:t.lat,lon:t.lon,savedAt:new Date().toISOString()},s=n.add(a);s.onsuccess=()=>{e(a)},s.onerror=()=>{o(new Error("Failed to add favorite"))}})}catch(e){throw console.error("Error adding favorite:",e),e}}async getAllFavorites(){try{return this.db||await this.openDB(),new Promise((t,e)=>{const n=this.db.transaction(["favorites"],"readonly").objectStore("favorites").getAll();n.onsuccess=()=>{t(n.result)},n.onerror=()=>{e(new Error("Failed to get favorites"))}})}catch(t){throw console.error("Error getting favorites:",t),t}}async getFavorite(t){try{return this.db||await this.openDB(),new Promise((e,o)=>{const a=this.db.transaction(["favorites"],"readonly").objectStore("favorites").get(t);a.onsuccess=()=>{e(a.result)},a.onerror=()=>{o(new Error("Failed to get favorite"))}})}catch(e){throw console.error("Error getting favorite:",e),e}}async deleteFavorite(t){try{return this.db||await this.openDB(),new Promise((e,o)=>{const a=this.db.transaction(["favorites"],"readwrite").objectStore("favorites").delete(t);a.onsuccess=()=>{e(!0)},a.onerror=()=>{o(new Error("Failed to delete favorite"))}})}catch(e){throw console.error("Error deleting favorite:",e),e}}async isFavorite(t){try{return!!await this.getFavorite(t)}catch{return!1}}async clearAllFavorites(){try{return this.db||await this.openDB(),new Promise((t,e)=>{const n=this.db.transaction(["favorites"],"readwrite").objectStore("favorites").clear();n.onsuccess=()=>{t(!0)},n.onerror=()=>{e(new Error("Failed to clear favorites"))}})}catch(t){throw console.error("Error clearing favorites:",t),t}}}const u=new D;class U{constructor(){this.currentPage=1}async render(){return`
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
    `}async afterRender(){this.initMap(),this.loadStories(),this.setupPagination()}initMap(){const t=document.getElementById("map"),e=L.map(t).setView([-6.2,106.816666],10),o=L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${l.MAP_API_KEY}`,{attribution:'&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),r=L.tileLayer(`https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.png?key=${l.MAP_API_KEY}`,{attribution:'&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}),n={Streets:o,Satellite:r};o.addTo(e),L.control.layers(n).addTo(e),navigator.geolocation&&navigator.geolocation.getCurrentPosition(a=>{const s=a.coords.latitude,c=a.coords.longitude;e.setView([s,c],15),L.marker([s,c]).addTo(e).bindPopup("Your Location").openPopup()},a=>{console.warn("Geolocation error:",a)}),this.map=e}async loadStories(){const t=document.getElementById("loading"),e=document.getElementById("stories-list");t.style.display="block",e.innerHTML="";try{const o=await A({page:this.currentPage}),r=o.listStory||[];await this.renderStories(r),this.addMarkers(r),this.setupStoryInteractions(r),this.updatePagination(o)}catch(o){localStorage.getItem("token")?e.innerHTML=`<p>Error loading stories: ${o.message}</p>`:e.innerHTML="<p>Login to view stories.</p>"}finally{t.style.display="none"}}async renderStories(t){const e=document.getElementById("stories-list"),o=await Promise.all(t.map(async r=>{const n=await u.isFavorite(r.id);return{...r,isFavorite:n}}));e.innerHTML=o.map(r=>`
      <div class="story-item" data-id="${r.id}">
        <a href="#/story/${r.id}">
          <img src="${r.photoUrl}" alt="${r.name||"Story"}" style="width: 100px; height: 100px;">
        </a>
        <h3><a href="#/story/${r.id}">${r.name||"Untitled"}</a></h3>
        <p>${r.description}</p>
        <p>Created: ${new Date(r.createdAt).toLocaleDateString()}</p>
        <button class="favorite-btn" data-id="${r.id}" style="
          background: ${r.isFavorite?"#ff4444":"#4CAF50"};
          color: white;
          border: none;
          padding: 8px 16px;
          cursor: pointer;
          border-radius: 4px;
          margin-top: 10px;
        ">
          ${r.isFavorite?"❤️ Hapus dari Favorit":"🤍 Tambah ke Favorit"}
        </button>
      </div>
    `).join(""),this.setupFavoriteButtons(o)}setupFavoriteButtons(t){document.querySelectorAll(".favorite-btn").forEach(e=>{e.addEventListener("click",async o=>{o.preventDefault();const r=e.dataset.id,n=t.find(a=>a.id===r);try{await u.isFavorite(r)?(await u.deleteFavorite(r),e.style.background="#4CAF50",e.innerHTML="🤍 Tambah ke Favorit",alert("Cerita dihapus dari favorit!")):(await u.addFavorite(n),e.style.background="#ff4444",e.innerHTML="❤️ Hapus dari Favorit",alert("Cerita ditambahkan ke favorit!"))}catch(a){console.error("Error toggling favorite:",a),alert("Gagal memperbarui favorit")}})})}addMarkers(t){this.map&&(this.markers=[],t.forEach(e=>{if(e.lat&&e.lon){const o=L.marker([e.lat,e.lon]).addTo(this.map);o.id=e.id,o.bindPopup(`
          <div>
            <img src="${e.photoUrl}" alt="${e.name}" style="width: 100px;">
            <h4>${e.name}</h4>
            <p>${e.description}</p>
          </div>
        `),this.markers.push(o)}}))}setupPagination(){document.getElementById("prev-btn").addEventListener("click",()=>{this.currentPage>1&&(this.currentPage--,this.loadStories())}),document.getElementById("next-btn").addEventListener("click",()=>{this.currentPage++,this.loadStories()})}updatePagination(t){const e=document.getElementById("prev-btn"),o=document.getElementById("next-btn"),r=document.getElementById("page-info");e.disabled=this.currentPage===1,o.disabled=(t.listStory||[]).length<10,r.textContent=`Page ${this.currentPage}`}setupStoryInteractions(t){document.querySelectorAll(".story-item").forEach(e=>{e.removeEventListener("mouseenter",e._storyMouseEnter),e.removeEventListener("mouseleave",e._storyMouseLeave),e._storyMouseEnter=null,e._storyMouseLeave=null}),document.querySelectorAll(".story-item").forEach(e=>{const o=e.dataset.id,r=this.markers.find(n=>n.id===o);r&&(e._storyMouseEnter=()=>{r.openPopup()},e._storyMouseLeave=()=>{r.closePopup()},e.addEventListener("mouseenter",e._storyMouseEnter),e.addEventListener("mouseleave",e._storyMouseLeave))}),this.markers.forEach(e=>{e.off("click"),e.on("click",()=>{window.location.hash=`#/story/${e.id}`})})}}function _(i){const t="=".repeat((4-i.length%4)%4),e=(i+t).replace(/-/g,"+").replace(/_/g,"/"),o=window.atob(e),r=new Uint8Array(o.length);for(let n=0;n<o.length;++n)r[n]=o.charCodeAt(n);return r}function S(i){let t="";const e=new Uint8Array(i),o=e.byteLength;for(let r=0;r<o;r++)t+=String.fromCharCode(e[r]);return window.btoa(t)}class O{async render(){return`
      <section class="container">
        <h1>Login</h1>
        <form id="login-form" class="form">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" id="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" required>
          </div>
          <div class="form-group">
            <button type="submit">Login</button>
          </div>
        </form>
        <p>Belum punya akun? <a href="#/register">Register</a></p>
      </section>
    `}async afterRender(){document.getElementById("login-form").addEventListener("submit",async e=>{e.preventDefault();const o=document.getElementById("email").value,r=document.getElementById("password").value;try{const n=await x({email:o,password:r});if(localStorage.setItem("token",n.loginResult.token),"serviceWorker"in navigator&&"PushManager"in navigator)try{const s=await(await navigator.serviceWorker.register("/sw.js")).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:_("BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk")}),c=S(s.getKey("p256dh")),d=S(s.getKey("auth"));await M({endpoint:s.endpoint,keys:{p256dh:c,auth:d}}),localStorage.setItem("pushSubscription",JSON.stringify({endpoint:s.endpoint,keys:{p256dh:c,auth:d}}))}catch(a){console.warn("Push subscription failed:",a)}alert("Login successful!"),window.location.hash="#/"}catch(n){alert("Login failed: "+n.message)}})}}class R{async render(){return`
      <section class="container">
        <h1>Register</h1>
        <form id="register-form">
          <div>
            <label for="name">Name:</label>
            <input type="text" id="name" required>
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="email" id="email" required>
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" id="password" required minlength="8">
          </div>
          <button type="submit">Register</button>
        </form>
        <p>Sudah punya akun? <a href="#/login">Login</a></p>
      </section>
    `}async afterRender(){document.getElementById("register-form").addEventListener("submit",async e=>{e.preventDefault();const o=document.getElementById("name").value,r=document.getElementById("email").value,n=document.getElementById("password").value;try{const a=await P({name:o,email:r,password:n});alert("Registration successful! Please login."),window.location.hash="#/login"}catch(a){alert("Registration failed: "+a.message)}})}}class j{#e=null;async render(){return`
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
    `}async afterRender(){this.initMap(),this.setupForm()}initMap(){const t=document.getElementById("map"),e=L.map(t).setView([-6.2,106.816666],10);L.tileLayer(`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${l.MAP_API_KEY}`,{attribution:'&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(e);let o=null;navigator.geolocation&&navigator.geolocation.getCurrentPosition(r=>{const n=r.coords.latitude,a=r.coords.longitude;e.setView([n,a],15),o=L.marker([n,a]).addTo(e).bindPopup("Your Location").openPopup()},r=>{console.warn("Geolocation error:",r)}),e.on("click",r=>{o&&e.removeLayer(o),document.getElementById("lat").value=r.latlng.lat,document.getElementById("lon").value=r.latlng.lng,o=L.marker([r.latlng.lat,r.latlng.lng]).addTo(e)})}setupForm(){const t=document.getElementById("add-form"),e=document.getElementById("camera-btn"),o=document.getElementById("capture-btn"),r=document.getElementById("retake-btn"),n=document.getElementById("photo"),a=document.getElementById("video"),s=document.getElementById("canvas"),c=document.getElementById("message");let d;n.addEventListener("change",g=>{const h=g.target.files[0];if(h){const m=new FileReader;m.onload=y=>{this.#e=y.target.result},m.readAsDataURL(h)}}),e.addEventListener("click",async()=>{try{d=await navigator.mediaDevices.getUserMedia({video:!0}),a.srcObject=d,a.style.display="block",o.style.display="inline-block",e.style.display="none"}catch{c.textContent="Camera access denied."}}),o.addEventListener("click",()=>{const g=s.getContext("2d");s.width=a.videoWidth,s.height=a.videoHeight,g.drawImage(a,0,0),s.toBlob(h=>{const m=new File([h],"camera.jpg",{type:"image/jpeg"}),y=new DataTransfer;y.items.add(m),n.files=y.files,this.#e=s.toDataURL("image/jpeg"),s.style.display="block",a.style.display="none",o.style.display="none",r.style.display="inline-block"})}),r.addEventListener("click",()=>{s.style.display="none",a.style.display="block",o.style.display="inline-block",r.style.display="none"}),t.addEventListener("submit",async g=>{g.preventDefault();const h=document.getElementById("description").value,m=document.getElementById("photo").files[0],y=document.getElementById("lat").value,I=document.getElementById("lon").value;try{const b=localStorage.getItem("token"),f=new FormData;f.append("description",h),f.append("photo",m),f.append("lat",y||"0"),f.append("lon",I||"0");let w;b?w=await F(f):w=await C(f),c.textContent="Story added successfully!",t.reset(),this.map&&this.map.eachLayer(v=>{v instanceof L.Marker&&this.map.removeLayer(v)}),this.#e=null,s.style.display="none",r.style.display="none",e.style.display="inline-block",d&&d.getTracks().forEach(v=>v.stop()),setTimeout(()=>{window.location.hash="#/home"},1e3)}catch(b){c.textContent=`Error: ${b.message}`}})}}function k(i){const t=i.split("/");return{resource:t[1]||null,id:t[2]||null}}function N(i){let t="";return i.resource&&(t=t.concat(`/${i.resource}`)),i.id&&(t=t.concat("/:id")),t||"/"}function B(){return location.hash.replace("#","")||"/"}function H(){const i=B(),t=k(i);return N(t)}function q(){const i=B();return k(i)}class W{async render(){return`
      <section class="container">
        <h1>Detail Cerita</h1>
        <div id="story-detail">
          <p>Loading...</p>
        </div>
      </section>
    `}async afterRender(){const{id:t}=q();if(!t){document.getElementById("story-detail").innerHTML="<p>Story ID not found.</p>";return}try{const o=(await T(t)).story;document.getElementById("story-detail").innerHTML=`
        <h2>${o.name}</h2>
        <p>${o.description}</p>
        <img src="${o.photoUrl}" alt="Story photo" style="max-width:100%;">
        <p>Created at: ${new Date(o.createdAt).toLocaleString()}</p>
        ${o.lat&&o.lon?`<p>Location: ${o.lat}, ${o.lon}</p>`:""}
      `}catch(e){localStorage.getItem("token")?document.getElementById("story-detail").innerHTML=`<p>Error: ${e.message}</p>`:document.getElementById("story-detail").innerHTML="<p>Login to view story detail.</p>"}}}class z{async render(){return`
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
    `}async afterRender(){await this.loadFavorites(),this.setupClearAllButton()}async loadFavorites(){const t=document.getElementById("favorites-list");try{const e=await u.getAllFavorites();if(e.length===0){t.innerHTML=`
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
        `;return}t.innerHTML=e.map(o=>`
        <div class="story-item" data-id="${o.id}">
          <a href="#/story/${o.id}">
            <img src="${o.photoUrl}" alt="${o.name||"Story"}" style="width: 100px; height: 100px;">
          </a>
          <h3><a href="#/story/${o.id}">${o.name||"Untitled"}</a></h3>
          <p>${o.description}</p>
          <p>Created: ${new Date(o.createdAt).toLocaleDateString()}</p>
          <p style="font-size: 12px; color: #666;">Disimpan: ${new Date(o.savedAt).toLocaleDateString()}</p>
          <button class="delete-favorite-btn" data-id="${o.id}" style="
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
      `).join(""),this.setupDeleteButtons()}catch(e){console.error("Error loading favorites:",e),t.innerHTML="<p>Error loading favorites</p>"}}setupDeleteButtons(){document.querySelectorAll(".delete-favorite-btn").forEach(t=>{t.addEventListener("click",async e=>{e.preventDefault();const o=t.dataset.id;if(confirm("Hapus cerita ini dari favorit?"))try{await u.deleteFavorite(o),alert("Cerita dihapus dari favorit!"),await this.loadFavorites()}catch(r){console.error("Error deleting favorite:",r),alert("Gagal menghapus favorit")}})})}setupClearAllButton(){document.getElementById("clear-all-btn").addEventListener("click",async()=>{if(confirm("Hapus semua cerita favorit? Tindakan ini tidak dapat dibatalkan!"))try{await u.clearAllFavorites(),alert("Semua favorit telah dihapus!"),await this.loadFavorites()}catch(e){console.error("Error clearing favorites:",e),alert("Gagal menghapus semua favorit")}})}}const K={"/":new U,"/login":new O,"/register":new R,"/add":new j,"/story/:id":new W,"/favorites":new z};class G{constructor(){this.registration=null}async init(){if(!("serviceWorker"in navigator))return console.log("Service Worker not supported"),!1;if(!("PushManager"in window))return console.log("Push Manager not supported"),!1;try{return this.registration=await navigator.serviceWorker.register("/sw.js",{scope:"/"}),console.log("Service Worker registered:",this.registration),await navigator.serviceWorker.ready,console.log("Service Worker is ready"),!0}catch(t){return console.error("Service Worker registration failed:",t),!1}}async requestPermission(){return await Notification.requestPermission()==="granted"}async subscribeToPushNotification(){try{if(!await this.requestPermission())return console.log("Notification permission denied"),null;const o=await(await navigator.serviceWorker.ready).pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:this.urlBase64ToUint8Array(l.VAPID_PUBLIC_KEY)});return console.log("Push subscription:",o),await this.sendSubscriptionToServer(o),o}catch(t){return console.error("Failed to subscribe to push notification:",t),null}}async sendSubscriptionToServer(t){const e=localStorage.getItem("token");if(!e){console.log("No token found, skipping subscription");return}try{const o=await fetch(`${l.BASE_URL}/notifications/subscribe`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify(t)});if(!o.ok)throw new Error("Failed to send subscription to server");const r=await o.json();console.log("Subscription sent to server:",r)}catch(o){console.error("Error sending subscription:",o)}}urlBase64ToUint8Array(t){const e="=".repeat((4-t.length%4)%4),o=(t+e).replace(/-/g,"+").replace(/_/g,"/"),r=window.atob(o),n=new Uint8Array(r.length);for(let a=0;a<r.length;++a)n[a]=r.charCodeAt(a);return n}async unsubscribe(){try{const e=await(await navigator.serviceWorker.ready).pushManager.getSubscription();e&&(await e.unsubscribe(),console.log("Unsubscribed from push notifications"))}catch(t){console.error("Failed to unsubscribe:",t)}}}const E=new G;class V{#e=null;#o=null;#t=null;constructor({navigationDrawer:t,drawerButton:e,content:o}){this.#e=o,this.#o=e,this.#t=t,this.#n(),this.initPWA()}async initPWA(){try{await u.openDB(),console.log("IndexedDB initialized"),await E.init()&&(console.log("Service Worker registered successfully"),localStorage.getItem("token")&&(await(await navigator.serviceWorker.ready).pushManager.getSubscription()||setTimeout(async()=>{await E.subscribeToPushNotification()&&console.log("Subscribed to push notifications")},2e3))),this.setupInstallPrompt()}catch(t){console.error("PWA initialization error:",t)}}setupInstallPrompt(){let t;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),t=e,this.showInstallButton(t)}),window.addEventListener("appinstalled",()=>{console.log("PWA was installed"),t=null})}showInstallButton(t){let e=document.getElementById("install-btn");e||(e=document.createElement("button"),e.id="install-btn",e.textContent="📱 Install App",e.style.cssText=`
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-size: 16px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 1000;
      `,document.body.appendChild(e)),e.addEventListener("click",async()=>{if(t){t.prompt();const{outcome:o}=await t.userChoice;console.log(`User response to install prompt: ${o}`),t=null,e.style.display="none"}})}#n(){this.#o.addEventListener("click",()=>{this.#t.classList.toggle("open")}),document.body.addEventListener("click",t=>{!this.#t.contains(t.target)&&!this.#o.contains(t.target)&&this.#t.classList.remove("open"),this.#t.querySelectorAll("a").forEach(e=>{e.contains(t.target)&&this.#t.classList.remove("open")})})}async renderPage(){const t=H();if(!localStorage.getItem("token")&&t!=="/register"&&t!=="/login"&&t!=="/add"&&t!=="/"&&!t.startsWith("/story/")&&t!=="/favorites"){window.location.hash="#/login";return}const o=K[t];if(!o){this.#e.innerHTML="<h1>Page not found</h1>";return}if(!document.startViewTransition)await this.#r(o);else{const r=document.startViewTransition(async()=>{await this.#r(o)});try{await r.finished}catch(n){console.error("Transition error:",n)}}}async#r(t){this.#e.innerHTML=await t.render(),await t.afterRender(),window.scrollTo(0,0)}}function J(i){const t="=".repeat((4-i.length%4)%4),e=(i+t).replace(/-/g,"+").replace(/_/g,"/"),o=atob(e),r=new Uint8Array(o.length);for(let n=0;n<o.length;n++)r[n]=o.charCodeAt(n);return r}async function Y(i){if(!("serviceWorker"in navigator)||!("PushManager"in window))return console.warn("SW or Push API not supported"),null;let t=null;try{t=await navigator.serviceWorker.register("/sw.js",{type:"module"}),console.log("SW registered:",t)}catch(r){return console.error("SW registration failed:",r),null}if(await Notification.requestPermission()!=="granted")return console.warn("Notification permission denied"),null;let o=await t.pushManager.getSubscription();o||(o=await t.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:J(i)}));try{await fetch("/api/save-subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(o)})}catch(r){console.error("Failed to store subscription:",r)}return localStorage.setItem("pushSubscription",JSON.stringify(o)),o}document.addEventListener("DOMContentLoaded",async()=>{let i=null;const t=document.getElementById("install-button");t&&(t.style.display="none"),window.addEventListener("beforeinstallprompt",a=>{a.preventDefault(),i=a,t&&(t.style.display="block"),t?.addEventListener("click",async()=>{if(!i)return;i.prompt();const s=await i.userChoice;console.log("Install choice:",s.outcome),i=null,t.style.display="none"})});const e="<YOUR_PUBLIC_VAPID_KEY>";try{const a=await Y(e);console.log("Push subscription:",a)}catch(a){console.error("Failed to register push subscription:",a)}const o=new V({content:document.querySelector("#main-content"),drawerButton:document.querySelector("#drawer-button"),navigationDrawer:document.querySelector("#navigation-drawer")}),r=()=>{const a=localStorage.getItem("token"),s=document.getElementById("register-li"),c=document.getElementById("login-li"),d=document.getElementById("logout-li");a?(s.style.display="none",c.style.display="none",d.style.display="block"):(s.style.display="block",c.style.display="block",d.style.display="none")};await o.renderPage(),r(),window.addEventListener("hashchange",async()=>{await o.renderPage(),r()}),document.getElementById("logout-btn")?.addEventListener("click",async()=>{const a=JSON.parse(localStorage.getItem("pushSubscription"));if(a){try{await $(a.endpoint),console.log("Unsubscribed from push")}catch(s){console.warn("Unsubscribe failed:",s)}localStorage.removeItem("pushSubscription")}localStorage.removeItem("token"),window.location.hash="#/login",r()})});
