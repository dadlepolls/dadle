import { KeyOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  from,
  InMemoryCache,
  ServerError
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { AuthContextProvider, useAuth } from "@components/AuthContext";
import { MobileDesktopSwitcher } from "@components/MobileDesktopSwitcher";
import {
  ResponsiveContextProvider,
  useWindowIsSm
} from "@components/ResponsiveContext";
import "@styles/globals.css";
import "@styles/OptionEditor.sass";
import "@styles/pollpage.css";
import LoadingBar from "@util/LoadingBar";
import { Layout, Menu } from "antd";
import { appWithTranslation, useTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import getConfig from "next/config";
import { Router, useRouter } from "next/router";
import "nprogress/nprogress.css";

const { publicRuntimeConfig } = getConfig();

const httpLink = createHttpLink({
  uri: `${publicRuntimeConfig?.backendPublicUrl ?? "/backend"}/graphql`,
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
  const router = useRouter();
  const isSm = useWindowIsSm();
  const { logout, user } = useAuth();
  const { t } = useTranslation("common");

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Layout.Header>
        {/*<div
          className="logo"
          style={{
            float: "left",
            width: "120px",
            height: "31px",
            margin: "16px 24px 16px 0",
            color: "white",
            fontWeight: 500,
          }
        >
          <span>DadleX</span>
        </div>*/}
        <Menu theme="dark" mode="horizontal" selectedKeys={[]}>
          <Menu.Item key="logo">
            <b>DadleX</b>
          </Menu.Item>
          <Menu.Item key="home" onClick={() => router.push("/")}>
            {t("navbar_home")}
          </Menu.Item>
          {user ? (
            <Menu.Item key="mypolls" onClick={() => router.push("/mypolls")}>
              {t("navbar_my_polls")}
            </Menu.Item>
          ) : null}
          {user ? (
            <Menu.SubMenu
              key="profileSub"
              icon={<UserOutlined />}
              style={{ marginLeft: "auto" }}
              title={`Hey ${user.name}`}
            >
              <Menu.Item key="profile" onClick={() => router.push("/profile")}>
                {t("navbar_my_profile")}
              </Menu.Item>
              <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                onClick={() => logout()}
              >
                {t("navbar_logout")}
              </Menu.Item>
            </Menu.SubMenu>
          ) : (
            <Menu.Item
              key="login"
              icon={<KeyOutlined />}
              onClick={() => window.location.replace("/backend/auth/login")}
              style={{ marginLeft: "auto" }}
            >
              {t("navbar_login")}
            </Menu.Item>
          )}
        </Menu>
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
            href="https://github.com/peterkappelt/dadlex"
            target="_blank"
            rel="noreferrer"
          >
            DadleX
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
  return (
    <ApolloProvider client={client}>
      <AuthContextProvider>
        <ResponsiveContextProvider>
          <AppLayout {...props} />
        </ResponsiveContextProvider>
      </AuthContextProvider>
    </ApolloProvider>
  );
}
export default appWithTranslation(App);
