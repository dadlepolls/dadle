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
import {
  ResponsiveContextProvider,
  useWindowIsSm
} from "@components/ResponsiveContext";
import "@styles/globals.css";
import "@styles/pollpage.css";
import LoadingBar from "@util/LoadingBar";
import { Layout, Menu } from "antd";
import type { AppProps } from "next/app";
import { Router, useRouter } from "next/router";
import "nprogress/nprogress.css";

const { Header, Content, Footer } = Layout;

const httpLink = createHttpLink({
  uri: "/backend/graphql",
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

  return (
    <Layout className="layout">
      <Header>
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
            Home
          </Menu.Item>
          {user ? (
            <Menu.SubMenu
              key="profileSub"
              icon={<UserOutlined />}
              style={{ marginLeft: "auto" }}
              title={`Hey ${user.name}`}
            >
              <Menu.Item key="profile" onClick={() => router.push("/profile")}>
                Mein Profil
              </Menu.Item>
              <Menu.Item
                key="logout"
                icon={<LogoutOutlined />}
                onClick={() => logout()}
              >
                Abmelden
              </Menu.Item>
            </Menu.SubMenu>
          ) : (
            <Menu.Item
              key="login"
              icon={<KeyOutlined />}
              onClick={() => (window.location.href = "/backend/auth/login")}
              style={{ marginLeft: "auto" }}
            >
              Anmelden
            </Menu.Item>
          )}
        </Menu>
      </Header>
      <Content style={{ padding: isSm ? "0 16px" : "0 50px" }}>
        <div
          style={{
            minHeight: "280px",
            paddingTop: "24px",
            paddingBottom: "24px",
          }}
        >
          <Component {...pageProps} />
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        DadleX | &copy;{new Date().getFullYear()} Peter Kappelt
      </Footer>
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
export default App;
