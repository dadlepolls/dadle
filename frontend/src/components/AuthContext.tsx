import { useQuery } from "@apollo/client";
import { GET_ME } from "@operations/queries/GetMe";
import { GetMe, GetMe_me } from "@operations/queries/__generated__/GetMe";
import { message } from "antd";
import jwt_decode from "jwt-decode";
import * as ls from "local-storage";
import { Router } from "next/router";
import React, { useContext, useEffect, useState } from "react";

const tokenExpiredObservers: (() => unknown)[] = [];

Router.events.on("routeChangeComplete", () => {
  //validate the JWT token on each route change
  if (typeof localStorage === "undefined") return;

  const storedToken = localStorage.getItem("token");
  if (!storedToken) return;

  try {
    const token = jwt_decode<{ exp?: number }>(storedToken);
    if (token.exp && token.exp * 1000 < new Date().getTime() + 60 * 1000)
      throw new Error(); //token will expiry in less than a minute
  } catch (_) {
    message.warning("Du wurdest abgemeldet, weil die Sitzung abgelaufen ist.");
    localStorage.removeItem("token");
    tokenExpiredObservers.forEach((o) => o());
  }
});

const AuthContext = React.createContext<{
  user?: GetMe_me;
  token?: string | null;
  authLoading: boolean;
  isAuthenticated: boolean;
  tryLogin: () => any;
  logout: () => any;
  // eslint-disable-next-line indent
}>({
  authLoading: true,
  tryLogin: () => {},
  logout: () => {},
  isAuthenticated: false,
});

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
  const forceReRender = () => setDummyState((x) => x + 1);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    tokenExpiredObservers.push(forceReRender);
    return () => {
      const idx = tokenExpiredObservers.indexOf(forceReRender);
      if (idx) tokenExpiredObservers.splice(idx, 1);
    };
  }, [forceReRender]);

  const { client, data } = useQuery<GetMe>(GET_ME, {
    skip: !token,
    onCompleted: ({ me: response }) => {
      message.success("Anmeldung erfolgreich!");
      if (response.name) ls.set("username", response.name);
      setAuthLoading(false);
    },
    onError: (error) => {
      message.error("Anmelden fehlgeschlagen: " + error.message);
      localStorage.removeItem("token");
      forceReRender();
      setAuthLoading(false);
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: data?.me,
        token,
        authLoading,
        tryLogin: forceReRender,
        logout: () => {
          localStorage.removeItem("token");
          client.resetStore();
          forceReRender();
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

