import { createClient } from '@neondatabase/neon-js'
import { BetterAuthReactAdapter } from '@neondatabase/neon-js/auth/react/adapters'

export const neon = createClient({
  auth: {
    adapter: BetterAuthReactAdapter(),
    url: import.meta.env.VITE_NEON_AUTH_URL,
  },
  dataApi: {
    url: import.meta.env.VITE_NEON_DATA_API_URL,
    // On force le SDK à récupérer le jeton à jour avant chaque requête
    getToken: async () => {
      const { data } = await neon.auth.getSession()
      return data?.session?.token ?? null
    }
  },
})