import HomePage from '../pages/home/home-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import AddPage from '../pages/add/add-page';
import RegisterPage from '../pages/auth/register-page';
import LoginPage from '../pages/auth/login-page';

const routes = {
  '/': new HomePage(),
  '/add': new AddPage(),
  '/register': new RegisterPage(),
  '/login': new LoginPage(),
  '/story/:id': new StoryDetailPage(),
};

export default routes;
