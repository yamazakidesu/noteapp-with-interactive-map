import HomePage from '../pages/home/home-page.js';
import LoginPage from '../pages/auth/login-page.js';
import RegisterPage from '../pages/auth/register-page.js';
import AddPage from '../pages/add/add-page.js';
import StoryPage from '../pages/story/story-detail-page.js';
import FavoritesPage from '../pages/favorites/favorite-page.js';

const routes = {
  '/': new HomePage(),
  '/login': new LoginPage(),
  '/register': new RegisterPage(),
  '/add': new AddPage(),
  '/story/:id': new StoryPage(),
  '/favorites': new FavoritesPage(),
};

export default routes;