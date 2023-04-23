import { KeyOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  from,
  InMemoryCache,
  ServerError,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { AuthContextProvider, useAuth } from "@components/AuthContext";
import { MobileDesktopSwitcher } from "@components/MobileDesktopSwitcher";
import {
  ResponsiveContextProvider,
  useWindowIsSm,
} from "@components/ResponsiveContext";
import "@styles/globals.css";
import "@styles/OptionEditor.sass";
import "@styles/pollpage.css";
import LoadingBar from "@util/LoadingBar";
import { Layout, Menu } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { appWithTranslation, useTranslation } from "next-i18next";
import type { AppProps } from "next/app";
import getConfig from "next/config";
import { Router, useRouter } from "next/router";
import "nprogress/nprogress.css";
import { useMemo } from "react";
import { static_config } from "src/static_config";

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

  const loginLogoutButton = useMemo<ItemType | null>(() => {
    if (!static_config.loginEnabled) return null;
    if (user)
      return {
        key: "profileSub",
        icon: <UserOutlined />,
        label: `Hey ${user.name}`,
        children: [
          {
            key: "profile",
            label: t("navbar_my_profile"),
          },
          {
            key: "logout",
            label: t("navbar_logout"),
            icon: <LogoutOutlined />,
          },
        ],
      };
    else
      return {
        key: "login",
        icon: <KeyOutlined />,
        label: t("navbar_login"),
      };
  }, [user, logout, router, t]);

  const menuItems = useMemo(() => {
    const items: ItemType[] = [
      {
        key: "logo",
        label: <b>Dadle</b>,
      },
      {
        type: "divider",
      },
      {
        key: "home",
        label: t("navbar_home"),
      },
    ];
    if (user)
      items.push({
        key: "mypolls",
        label: t("navbar_my_polls"),
      });
    if (loginLogoutButton) items.push(loginLogoutButton);
    return items;
  }, [user, loginLogoutButton]);

  const onMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case "home":
        router.push("/");
        break;
      case "mypolls":
        router.push("/mypolls");
        break;
      case "profile":
        router.push("/profile");
        break;
      case "logout":
        logout();
        break;
      case "login":
        window.location.replace("/backend/auth/login");
        break;
    }
  };

  return (
    <Layout className="layout" style={{ minHeight: "100vh" }}>
      <Layout.Header>
        {/* Left-Align the login menu item */}
        <style jsx global>
          {`
            .ant-menu li:nth-last-child(2) {
              margin-left: auto;
            }
          `}
        </style>
        <Menu
          items={menuItems}
          theme="dark"
          mode="horizontal"
          onClick={onMenuClick}
        />
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
