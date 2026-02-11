import HomePage from '../pages/home.jsx';
import AboutPage from '../pages/about.jsx';
import FormPage from '../pages/form.jsx';
import LoginPage from '../pages/Login.jsx';
import TestPage from '../pages/test.jsx';

// WICHTIG: Stelle sicher, dass die Dateinamen exakt übereinstimmen!
import KinderPage from '../pages/kinder.jsx'; 
import KindDetailPage from '../pages/KindDetailPage.jsx'; // Die neue Detail-Seite
import SettingsPage from '../pages/settings.jsx';
import CatalogPage from '../pages/catalog.jsx';
import NightLightPage from '../pages/nightlight.jsx';
import DynamicRoutePage from '../pages/dynamic-route.jsx';
import RequestAndLoad from '../pages/request-and-load.jsx';
import NotFoundPage from '../pages/404.jsx';

import { requireAuth } from './authGuard';

var routes = [
  {
    path: '/',
    component: LoginPage,
  },
  {
    path: '/login/',
    component: LoginPage,
  },
  {
    path: '/nightlight/',
    component: NightLightPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/home/',
    component: HomePage,
    beforeEnter: requireAuth,
  },
  {
    path: '/about/',
    component: AboutPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/form/',
    component: FormPage,
    beforeEnter: requireAuth,
  },
  {
    // Die Listen-Übersicht aller Kinder
    path: '/kinder/',
    component: KinderPage,
    beforeEnter: requireAuth,
  },
  {
    // Die Detail-Ansicht für ein spezifisches Kind
    // Der :id Parameter wird automatisch an KindDetailPage übergeben (via f7route props)
    path: '/kind/:id/',
    component: KindDetailPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/catalog/',
    component: CatalogPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/settings/',
    component: SettingsPage,
    beforeEnter: requireAuth,
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    component: DynamicRoutePage,
    beforeEnter: requireAuth,
  },
  {
    path: '/request-and-load/user/:userId/',
    beforeEnter: requireAuth,
    async: function ({ router, to, resolve }) {
      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = to.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            component: RequestAndLoad,
          },
          {
            props: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;