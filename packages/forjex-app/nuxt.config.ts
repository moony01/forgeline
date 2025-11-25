// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app: {
    baseURL: '/forjex/forjex-app/',
    head: {
      title: 'Forjex App',
    },
  },
  compatibilityDate: '2025-07-15',
});
