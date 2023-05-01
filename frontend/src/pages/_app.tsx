import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  ServerError,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { AppMenu } from "@components/AppMenu";
import { AuthContextProvider } from "@components/AuthContext";
import { MobileDesktopSwitcher } from "@components/MobileDesktopSwitcher";
import {
  ResponsiveContextProvider,
  useWindowIsSm,
} from "@components/ResponsiveContext";
import "@styles/OptionEditor.sass";
import "@styles/pollpage.css";
import LoadingBar from "@util/LoadingBar";
import { ConfigProvider, Layout, theme } from "antd";
import "antd/dist/reset.css";
import { appWithTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { static_config } from "src/static_config";

const httpLink = createHttpLink({
  uri: `${static_config.backendUrl}/graphql`,
});
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});
const errorLink = onError((error) => {
  if (
    error.networkError &&
    "statusCode" in error.networkError &&
    (error.networkError as ServerError).statusCode == 401 &&
    localStorage.getItem("token")
  ) {
    localStorage.removeItem("token");
    window.location.replace("/");
  }
});

const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Poll: {
        fields: {
          participations: {
            merge(_, incoming: any[]) {
              return incoming;
            },
          },
          comments: {
            merge(_, incoming: any[]) {
              return incoming;
            },
          },
          options: {
            merge(_, incoming: any[]) {
              return incoming;
            },
          },
        },
      },
    },
  }),
});

Router.events.on("routeChangeStart", () => LoadingBar.start());
Router.events.on("routeChangeComplete", () => LoadingBar.done());
Router.events.on("routeChangeError", () => LoadingBar.done());

function AppLayout({ Component, pageProps }: AppProps) {
  const isSm = useWindowIsSm();

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Layout.Header>
        <AppMenu mobile={isSm} />
      </Layout.Header>
      <Layout.Content style={{ padding: isSm ? "0 16px" : "0 50px" }}>
        <div
          style={{
            minHeight: "280px",
            paddingTop: "24px",
            paddingBottom: "24px",
          }}
        >
          <Component {...pageProps} />
        </div>
      </Layout.Content>
      <Layout.Footer style={{ textAlign: "center" }}>
        <MobileDesktopSwitcher />
        <br />
        <small>
          <a
            href="https://github.com/dadlepolls/dadle"
            target="_blank"
            rel="noreferrer"
          >
            Dadle
          </a>
          &nbsp;{process.env.NEXT_PUBLIC_APP_VERSION ?? "version_unknown"} |
          &copy;&nbsp;2021&nbsp;-&nbsp;
          {new Date().getFullYear()}
        </small>
      </Layout.Footer>
    </Layout>
  );
}

function App(props: AppProps) {
  const [darkMode, setDarkMode] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    )
      setDarkMode(true);
    else setDarkMode(false);
  }, []);

  return (
    <ApolloProvider client={client}>
      <AuthContextProvider>
        <ResponsiveContextProvider>
          <ConfigProvider
            theme={{
              algorithm: darkMode
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
            }}
          >
            <AppLayout {...props} />
          </ConfigProvider>
        </ResponsiveContextProvider>
      </AuthContextProvider>
    </ApolloProvider>
  );
}
export default appWithTranslation(App);
