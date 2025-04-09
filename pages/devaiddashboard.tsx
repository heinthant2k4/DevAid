import React, { useEffect, useState } from "react";
import AdminLayout from "../components/layout";
import { Card, Row, Col, Table, Tag, Spin } from "antd";
import { Line } from "@ant-design/charts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { DollarOutlined, UserOutlined, FundOutlined } from "@ant-design/icons";

const Dashboard: React.FC = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [amountDonatedBack, setAmountDonatedBack] = useState(0);
  const [topDonors, setTopDonors] = useState<{ id: string; name: string; amount: number }[]>([]);
  const [donationTrends, setDonationTrends] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch total donations and donors
  const fetchTotalDonations = async () => {
    const snapshot = await getDocs(collection(db, "donations"));
    const donations = snapshot.docs.map((doc) => doc.data());
    const totalAmount = donations.reduce((sum, donation) => {
      const amount = parseFloat(donation.amount) || 0;
      return sum + amount;
    }, 0);
    const uniqueDonors = new Set(donations.map((donation) => donation.name || "Anonymous")).size;
    setTotalDonations(totalAmount);
    setTotalDonors(uniqueDonors);
  };

  // Fetch amount donated back
  const fetchAmountDonatedBack = async () => {
    const snapshot = await getDocs(collection(db, "donationDetails"));
    const donationDetails = snapshot.docs.map((doc) => doc.data());
    const totalDonatedBack = donationDetails.reduce((sum, detail) => sum + (detail.total || 0), 0);
    setAmountDonatedBack(totalDonatedBack);
  };

  // Fetch top donors
  const fetchTopDonors = async () => {
    const snapshot = await getDocs(collection(db, "donations"));
    const donations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { name?: string; amount?: number }),
    }));
    const sortedDonations = donations
      .map((donation) => ({
        id: donation.id,
        name: donation.name || "Anonymous",
        amount: donation.amount || 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 donors
    setTopDonors(sortedDonations);
  };

  // Fetch donation trends
  const fetchDonationTrends = async () => {
    const snapshot = await getDocs(collection(db, "donations"));
    const donations = snapshot.docs.map((doc) => doc.data());
    const trendsMap = donations.reduce((acc, donation) => {
      const date = donation.createdAt
        ? new Date(donation.createdAt.seconds * 1000).toLocaleDateString("en-GB")
        : "Unknown";
      acc[date] = (acc[date] || 0) + (donation.amount || 0);
      return acc;
    }, {} as { [key: string]: number });

    const trendsData = Object.entries(trendsMap)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setDonationTrends(trendsData);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTotalDonations(),
        fetchAmountDonatedBack(),
        fetchTopDonors(),
        fetchDonationTrends(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Line Chart Config
  const lineConfig = {
    data: donationTrends,
    xField: "date",
    yField: "value",
    color: "#1890ff",
    point: {
      size: 5,
      shape: "diamond",
      style: { fill: "#1890ff", stroke: "#fff", lineWidth: 2 },
    },
    label: {
      style: { fill: "#333", fontSize: 12 },
    },
    xAxis: {
      label: { autoRotate: true, style: { fontSize: 12 } },
    },
    yAxis: {
      label: {
        formatter: (value: string) => `${parseInt(value).toLocaleString()} MMK`,
      },
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: "Donation Amount",
        value: `${datum.value.toLocaleString()} MMK`,
      }),
    },
    interactions: [{ type: "marker-active" }],
  };

  // Table Columns for Top Donors
  const columns = [
    {
      title: "Donor Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span style={{ color: "#1890ff", fontWeight: "600" }}>{text}</span>,
    },
    {
      title: "Amount (MMK)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Tag color="#00cc99" style={{ fontWeight: "bold", padding: "4px 8px" }}>
          {amount.toLocaleString()} MMK
        </Tag>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: "24px", background: "#f0f2f5" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "24px",
            color: "#1890ff",
            letterSpacing: "1px",
          }}
        >
          Dashboard
        </h1>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card
                  title={<span style={{ color: "#fff" }}>Total Donations</span>}
                  bordered={false}
                  style={{
                    background: "#00cc99",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  headStyle={{ background: "#00cc99", color: "#fff", borderBottom: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <DollarOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
                    <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                      MMK {totalDonations.toLocaleString()}
                    </span>
                  </div>
                </Card>
                <Card
                  title={<span style={{ color: "#fff" }}>Total Donors</span>}
                  bordered={false}
                  style={{
                    background: "#ff7043",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  headStyle={{ background: "#ff7043", color: "#fff", borderBottom: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <UserOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
                    <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                      {totalDonors.toLocaleString()}
                    </span>
                  </div>
                </Card>
                <Card
                  title={<span style={{ color: "#fff" }}>Amount Donated Back</span>}
                  bordered={false}
                  style={{
                    background: "#ffca28",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  headStyle={{ background: "#ffca28", color: "#fff", borderBottom: "none" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <FundOutlined style={{ fontSize: "24px", marginRight: "8px" }} />
                    <span style={{ fontSize: "24px", fontWeight: "bold" }}>
                      MMK {amountDonatedBack.toLocaleString()}
                    </span>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={24} md={18}>
                <Card
                  title={<span style={{ color: "#fff" }}>Top Donors</span>}
                  bordered={false}
                  style={{
                    background: "#1890ff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  headStyle={{ background: "#1890ff", color: "#fff", borderBottom: "none" }}
                >
                  <Table
                    columns={columns}
                    dataSource={topDonors}
                    rowKey="id"
                    pagination={false}
                    style={{ background: "#fff", borderRadius: "8px" }}
                  />
                </Card>
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
              <Col xs={24}>
                <Card
                  title={<span style={{ color: "#fff" }}>Donation Trends Over Time</span>}
                  bordered={false}
                  style={{
                    background: "#7b1fa2",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  }}
                  headStyle={{ background: "#7b1fa2", color: "#fff", borderBottom: "none" }}
                >
                  <div style={{ background: "#fff", borderRadius: "8px", padding: "16px" }}>
                    {donationTrends.length > 0 ? (
                      <Line {...lineConfig} style={{ height: "300px" }} />
                    ) : (
                      <p style={{ textAlign: "center", color: "#999", fontSize: "16px" }}>
                        No data available
                      </p>
                    )}
                  </div>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;