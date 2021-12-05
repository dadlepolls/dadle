import { MailOutlined } from "@ant-design/icons";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import LoadingBar from "@components/LoadingBar";
import {
  ResponsiveContextProvider,
  useWindowIsSm
} from "@components/ResponsiveContext";
import "@styles/globals.css";
import "@styles/pollpage.css";
import { Layout, Menu } from "antd";
import type { AppProps } from "next/app";
import { Router } from "next/dist/client/router";
import "nprogress/nprogress.css";

const { Header, Content, Footer } = Layout;

const client = new ApolloClient({
  uri: "/graphql",
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
    <Layout className="layout">
      <Header>
        <div
          className="logo"
          style={{
            float: "left",
            width: "120px",
            height: "31px",
            margin: "16px 24px 16px 0",
            color: "white",
            fontWeight: 500,
          }}
        >
          <span>DadleX</span>
        </div>
        <Menu theme="dark" mode="horizontal">
          <Menu.SubMenu
            key="profileSub"
            icon={<MailOutlined />}
            style={{ marginLeft: "auto" }}
            title="Hey!"
          >
            <Menu.Item key="profileDummy">Dummy</Menu.Item>
          </Menu.SubMenu>
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
      <ResponsiveContextProvider>
        <AppLayout {...props} />
      </ResponsiveContextProvider>
    </ApolloProvider>
  );
}
export default App;
