import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,

  fetchOptions: {

    onSuccess: (ctx) => {
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken && typeof window !== "undefined") {
        localStorage.setItem("access_token", authToken);
      }
    },

    auth: {
      type: "Bearer",
      token: () =>
        typeof window !== "undefined"
          ? localStorage.getItem("access_token") || ""
          : "",
    },
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;