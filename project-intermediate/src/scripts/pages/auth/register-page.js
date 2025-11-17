import { register } from '../../data/api.js';

export default class RegisterPage {
  async render() {
    return `
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
    `;
  }

  async afterRender() {
    const form = document.getElementById('register-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const result = await register({ name, email, password });
        alert('Registration successful! Please login.');
        window.location.hash = '#/login';
      } catch (error) {
        alert('Registration failed: ' + error.message);
      }
    });
  }
}
