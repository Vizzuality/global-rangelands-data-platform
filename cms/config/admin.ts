const getAdminCookiePath = (cmsUrl: string | null) => {
  const basePath = cmsUrl ? new URL(cmsUrl, 'http://localhost').pathname.replace(/\/$/, '') : '';
  return `${basePath}/admin`;
};

export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    cookie: {
      path: getAdminCookiePath(env('CMS_URL', null)),
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
