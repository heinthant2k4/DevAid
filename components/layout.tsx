import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TableOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";

const { Sider, Content } = Layout;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  // Map routes to menu keys
  const menuKeyMap: { [key: string]: string } = {
    "/dashboard": "dashboard",
    "/donations": "donations",
  };

  // Get the current menu key based on the route
  const selectedKey = menuKeyMap[router.pathname] || "";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div
          className="logo"
          style={{
            color: "white",
            padding: "16px",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "20px",
          }}
        >
          Admin Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]} // Dynamically set the selected menu item
        >
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link href="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="donations" icon={<TableOutlined />}>
            <Link href="/donations">Donations</Link>
          </Menu.Item>
          <Menu.Item key="logout" icon={<LogoutOutlined />}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ margin: "16px", padding: "16px", background: "#fff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;