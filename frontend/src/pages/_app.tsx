import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import "@styles/globals.css";
import type { AppProps } from "next/app";

const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache(),
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
export default MyApp;
