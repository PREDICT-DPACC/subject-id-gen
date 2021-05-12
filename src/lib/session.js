import { withIronSession } from 'next-iron-session';

export default function withSession(handler) {
  return withIronSession(handler, {
    password: process.env.COOKIE_SECRET,
    cookieName: 'subject-id-gen',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  });
}
