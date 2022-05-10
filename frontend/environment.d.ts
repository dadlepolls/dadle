declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
      PORT?: string;
      PWD: string;
      NEXT_PUBLIC_AUTH_ISSUER_BASEURL?: string;
      NEXT_PUBLIC_CAL_MS_TENANT_ID?: string;
      NEXT_PUBLIC_CAL_GOOGLE_CLIENT_ID?: string;
    }
  }
}

export {};
