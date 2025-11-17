import { getStoryDetail } from '../../data/api.js';
import { parseActivePathname } from '../../routes/url-parser.js';

export default class StoryDetailPage {
  async render() {
    return `
      <section class="container">
        <h1>Detail Cerita</h1>
        <div id="story-detail">
          <p>Loading...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();
    if (!id) {
      document.getElementById('story-detail').innerHTML = '<p>Story ID not found.</p>';
      return;
    }
    try {
      const result = await getStoryDetail(id);
      const story = result.story;
      document.getElementById('story-detail').innerHTML = `
        <h2>${story.name}</h2>
        <p>${story.description}</p>
        <img src="${story.photoUrl}" alt="Story photo" style="max-width:100%;">
        <p>Created at: ${new Date(story.createdAt).toLocaleString()}</p>
        ${story.lat && story.lon ? `<p>Location: ${story.lat}, ${story.lon}</p>` : ''}
      `;
    } catch (error) {
      if (!localStorage.getItem('token')) {
        document.getElementById('story-detail').innerHTML = '<p>Login to view story detail.</p>';
      } else {
        document.getElementById('story-detail').innerHTML = `<p>Error: ${error.message}</p>`;
      }
    }
  }
}
