




import React, { useState, useEffect } from "react";
import AdminLayout from "../components/layout";
import { Table, Button } from "antd";

/**
 * A component that displays a table of donations with donor name, amount, and date.
 * The component fetches donation data from Firestore or API on mount and renders
 * a table with the data. The table also includes an actions column with a delete
 * button.
 */

const Donations: React.FC = () => {
  const [data, setData] = useState([{key: "", name: "", amount: 0, date: ""}]);

  useEffect(() => {
    // Fetch donations from Firestore or API
    const fetchData = async () => {
      const donations = [
        { key: "1", name: "John Doe", amount: 5000, date: "2025-04-01" },
        { key: "2", name: "Jane Smith", amount: 3000, date: "2025-04-02" },
      ];
      setData(donations);
    };

    fetchData();
  }, []);

  const columns = [
    {
      title: "Donor Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Amount (MMK)",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Button type="link" danger>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Donations</h1>
      <Table columns={columns} dataSource={data} />
    </AdminLayout>
  );
};

export default Donations;