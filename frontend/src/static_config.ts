const static_config = {
  loginEnabled: !!process.env.NEXT_PUBLIC_AUTH_ISSUER_BASEURL,
  calMsEnabled: !!process.env.NEXT_PUBLIC_CAL_MS_TENANT_ID,
  calGoogleEnabled: !!process.env.NEXT_PUBLIC_CAL_GOOGLE_CLIENT_ID,
};

export { static_config };
