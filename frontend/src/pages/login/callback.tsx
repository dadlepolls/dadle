import { useAuth } from "@components/AuthContext";
import { ErrorPage } from "@components/ErrorPage";
import { LoadingCard } from "@components/LoadingCard";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const LoginCallbackPage: NextPage = () => {
  const { t } = useTranslation("logincallback");
  const router = useRouter();
  const { tryLogin } = useAuth();
  const [isMissingTokenInQuery, setIsMissingTokenInQuery] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | undefined>();

  useEffect(() => {
    if (router.isReady && !router.query.token) setIsMissingTokenInQuery(true);
  }, [router.isReady, router.query.token]);

  useEffect(() => {
    if (router.isReady && router.query.failureMsg)
      setFailureMessage(String(router.query.failureMsg));
  }, [router.isReady, router.query.failureMsg]);

  useEffect(() => {
    if (typeof localStorage !== undefined && router.query.token) {
      localStorage.setItem("token", String(router.query.token));
      tryLogin();
      router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.token]);

  if (isMissingTokenInQuery || failureMessage) {
    if (failureMessage)
      return <ErrorPage error={t("errorcode", { message: failureMessage })} />;
    else return <ErrorPage error={t("error_generic")} />;
  }

  return <LoadingCard title={t("logging_in")} />;
};

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "logincallback"])),
    },
  };
}

export default LoginCallbackPage;
