export const environment = {
  production: true,
  // Same-origin path: nginx (see fittrack-frontend/nginx.conf) proxies
  // /api/ to the backend service over the docker-compose network.
  apiBaseUrl: '/api/v1'
};
