import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TableOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";

const { Header, Sider, Content } = Layout;

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible>
        <div className="logo" style={{ color: "white", padding: "16px", textAlign: "center", fontWeight: "bold" }}>
          Admin Dashboard
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link href="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<TableOutlined />}>
            <Link href="/donations">Donations</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<LogoutOutlined />}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Header style={{ background: "#fff", padding: 0, textAlign: "center", fontWeight: "bold" }}>
          Admin Dashboard
        </Header>
        <Content style={{ margin: "16px", padding: "16px", background: "#fff" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;