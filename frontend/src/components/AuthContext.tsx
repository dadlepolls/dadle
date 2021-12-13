import { useQuery } from "@apollo/client";
import { GET_ME } from "@operations/queries/GetMe";
import { GetMe, GetMe_me } from "@operations/queries/__generated__/GetMe";
import { message } from "antd";
import * as ls from "local-storage";
import React, { useContext, useState } from "react";

const AuthContext = React.createContext<{
  user?: GetMe_me;
  isAuthenticated: boolean;
  tryLogin: () => any;
  logout: () => any;
  // eslint-disable-next-line indent
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

  const [_, setDummyState] = useState(0); //dummy state to force update when trying login

  const { client, data } = useQuery<GetMe>(GET_ME, {
    skip: !token,
    onCompleted: ({ me: response }) => {
      message.success("Anmeldung erfolgreich!");
      if (response.name) ls.set("username", response.name);
    },
    onError: (error) => {
      message.error("Anmelden fehlgeschlagen: " + error.message);
      localStorage.removeItem("token");
      setDummyState((x) => x + 1);
    },
  });

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

