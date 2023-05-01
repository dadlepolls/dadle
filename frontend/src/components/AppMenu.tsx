import {
  KeyOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "@components/AuthContext";
import { Drawer, Menu } from "antd";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { static_config } from "src/static_config";

const useMenuClickHandler = () => {
  const router = useRouter();
  const { logout } = useAuth();
  return (key: string) => {
    switch (key) {
      case "logo":
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
        window.location.replace(`${static_config.backendUrl}/auth/login`);
        break;
    }
  };
};

const AppMenu = ({ mobile }: { mobile: boolean }): JSX.Element => {
  return mobile ? <AppMenuMobile /> : <AppMenuDesktop />;
};

const AppMenuDesktop = (): JSX.Element => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const onMenuClick = useMenuClickHandler();

  const loginLogoutButton = useMemo<ItemType | null>(() => {
    if (!static_config.loginEnabled) return null;
    if (user)
      return {
        key: "profileSub",
        icon: <UserOutlined />,
        label: `Hey ${user.name}`,
        onTitleClick: () => onMenuClick("profile"),
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
  }, [user, router, t]);

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

  return (
    <>
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
        selectedKeys={[]}
        theme="dark"
        mode="horizontal"
        onClick={({ key }) => onMenuClick(key)}
      />
    </>
  );
};

const AppMenuMobile = (): JSX.Element => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const router = useRouter();
  const onMenuClick = useMenuClickHandler();

  const menuItems = useMemo(() => {
    let items: ItemType[] = [];
    items.push({
      key: "home",
      label: t("navbar_home"),
    });
    if (user) {
      items.push({
        key: "mypolls",
        label: t("navbar_my_polls"),
      });
      items.push({ type: "divider" });
      items.push({
        key: "profile",
        icon: <UserOutlined />,
        label: `Hey ${user.name}`,
      });
      items.push({
        key: "logout",
        label: t("navbar_logout"),
        icon: <LogoutOutlined />,
      });
    } else if (static_config.loginEnabled) {
      items.push({
        key: "login",
        icon: <KeyOutlined />,
        label: t("navbar_login"),
      });
    }
    return items;
  }, [user, router, t]);

  return (
    <>
      {/* Left-Align the drawer menu item */}
      <style jsx global>
        {`
          .ant-menu li:nth-last-child(2) {
            margin-left: auto;
          }
        `}
      </style>
      <Menu
        items={[
          {
            key: "logo",
            label: <b>Dadle</b>,
          },
          {
            key: "drawer",
            label: <MenuOutlined />,
          },
        ]}
        selectedKeys={[]}
        onClick={({ key }) => {
          if (key == "drawer") setDrawerOpen((o) => !o);
          if (key == "logo") router.push("/");
        }}
        theme="dark"
        mode="horizontal"
      />
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Menu
          mode="vertical"
          style={{ width: "100%", background: "none", borderRight: "none" }}
          items={menuItems}
          onClick={({ key }) => {
            onMenuClick(key);
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </>
  );
};

export { AppMenu };

