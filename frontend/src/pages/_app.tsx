import { MailOutlined } from "@ant-design/icons";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "@styles/globals.css";
import { Layout, Menu } from "antd";
import type { AppProps } from "next/app";

const { Header, Content, Footer } = Layout;

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
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
        <Content style={{ padding: "50px 50px 0 50px" }}>
          <div
            style={{ minHeight: "280px", padding: "24px" }}
          >
            <Component {...pageProps} />
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          DadleX | &copy;{new Date().getFullYear()} Peter Kappelt
        </Footer>
      </Layout>
    </ApolloProvider>
  );
}
export default MyApp;
