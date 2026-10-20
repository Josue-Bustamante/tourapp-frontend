export const environment = {
  production: false,
  // Las peticiones /v1 se redirigen a Spring Boot mediante proxy.conf.json
  // (http://localhost:9494). Así evitamos problemas de CORS en desarrollo.
  HOST: '',
};
