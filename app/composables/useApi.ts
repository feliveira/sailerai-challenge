// composables/useApi.ts
export function useApi() {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBase,
  });

  return api;
}
