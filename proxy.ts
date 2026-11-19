import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Only run middleware on /presentation routes.
  matcher: [
    '/presentation',
    '/presentation/(.*)',
    '/(en|fr|ar)/presentation',
    '/(en|fr|ar)/presentation/(.*)',
  ],
};
