import { useAuth } from "@components/AuthContext";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const LoginCallbackPage: NextPage = () => {
  const router = useRouter();
  const { tryLogin } = useAuth();
  const [isMissingTokenInQuery, setIsMissingTokenInQuery] = useState(false);

  useEffect(() => {
    if (router.isReady && !router.query.token) setIsMissingTokenInQuery(true);
  }, [router.isReady, router.query.token]);

  useEffect(() => {
    if (typeof localStorage !== undefined && router.query.token) {
      localStorage.setItem("token", String(router.query.token));
      tryLogin();
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.token]);

  if (isMissingTokenInQuery) {
    return <ErrorPage error={"Es wurde kein Token erzeugt"} />;
  }

  return <LoadingCard title="Anmeldung läuft..." />;
};

export default LoginCallbackPage;
