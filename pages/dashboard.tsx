import React, { useEffect } from "react";
import AdminLayout from "../components/layout";
import { Card, Row, Col } from "antd";
import { Pie } from "@antv/g2plot";

const Dashboard: React.FC = () => {
  useEffect(() => {
    // Example Pie Chart
    const pieChart = new Pie("donation-chart", {
      appendPadding: 10,
      data: [
        { type: "Google Sheets", value: 40 },
        { type: "Firestore", value: 60 },
      ],
      angleField: "value",
      colorField: "type",
      radius: 0.8,
      label: {
        type: "outer",
        content: "{name} {percentage}",
      },
    });

    pieChart.render();
  }, []);

  return (
    <AdminLayout>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Dashboard</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Total Donations" bordered={false}>
            MMK 1,000,000
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Donations This Month" bordered={false}>
            MMK 200,000
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Top Donor" bordered={false}>
            John Doe
          </Card>
        </Col>
      </Row>
      <div style={{ marginTop: "24px" }}>
        <Card title="Donations by Source" bordered={false}>
          <div id="donation-chart" style={{ height: "300px" }}></div>
        </Card>
      </div>
    </AdminLayout>
  );
};``

export default Dashboard;