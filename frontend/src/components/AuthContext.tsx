import { ApolloError, useQuery } from "@apollo/client";
import { GET_ME } from "@operations/queries/GetMe";
import { GetMe, GetMe_me } from "@operations/queries/__generated__/GetMe";
import { message } from "antd";
import React, { useContext, useEffect, useState } from "react";

const AuthContext = React.createContext<{
  user?: GetMe_me;
  isAuthenticated: boolean;
  tryLogin: () => any;
  logout: () => any;
}>({ tryLogin: () => {}, logout: () => {}, isAuthenticated: false });

const AuthContextProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("token")
      : undefined;

  const { client, loading, data, error } = useQuery<GetMe>(GET_ME, {
    skip: !token,
  });
  const [_, setDummyState] = useState(0); //dummy state to force update when trying login
  const [previousLoadingState, setPreviousLoadingState] = useState(false);
  const [previousError, setPreviousError] = useState<ApolloError | undefined>();

  useEffect(() => {
    if (loading && !previousLoadingState) message.info("Anmeldung läuft...");
    if (loading !== previousLoadingState) setPreviousLoadingState(loading);
  }, [loading]);

  useEffect(() => {
    if (error && !previousError)
      message.error("Anmelden fehlgeschlagen: " + error.message);
    if (error && !previousError) {
      setPreviousError(error);
      localStorage.removeItem("token");
    }
  }, [error]);

  return (
    <AuthContext.Provider
      value={{
        user: data?.me,
        tryLogin: () => setDummyState((x) => x + 1),
        logout: () => {
          localStorage.removeItem("token");
          client.resetStore();
          setDummyState((x) => x + 1);
          message.success("Erfolgreich abgemeldet!");
        },
        isAuthenticated: data?.me && data.me._id ? true : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthContextProvider, useAuth };

