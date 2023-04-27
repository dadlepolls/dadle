const static_config = {
  loginEnabled: !!process.env.NEXT_PUBLIC_AUTH_ISSUER_BASEURL,
  calMsEnabled: !!process.env.NEXT_PUBLIC_CAL_MS_TENANT_ID,
  calGoogleEnabled: !!process.env.NEXT_PUBLIC_CAL_GOOGLE_CLIENT_ID,
  backendUrl: String(process.env.NEXT_PUBLIC_BACKEND_PUBLIC_URL),
};

if (!process.env.NEXT_PUBLIC_BACKEND_PUBLIC_URL) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "Caution: BACKEND_PUBLIC_URL is not set, implicetly using '/backend'"
    );
    static_config.backendUrl = "/backend";
  } else {
    throw new Error("BACKEND_PUBLIC_URL must be set!");
  }
}

export { static_config };
