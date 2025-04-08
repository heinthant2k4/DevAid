import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Table,
  Typography,
  Layout,
  Switch,
  Space,
  Card,
  ConfigProvider,
  theme as antdTheme,
  Input,
  Button,
} from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SunOutlined, MoonOutlined, DownloadOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

// Define the shape of your donation data
interface Donation {
  id: string;
  name: string;
  amount: number;
  date: string;
  compositeKey: string;
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch donations from Firestore
  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, 'donations');
    getDocs(colRef)
      .then((snapshot) => {
        const donationsArray: Donation[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Donation[];
        setDonations(donationsArray);
        setFilteredDonations(donationsArray);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = donations.filter((donation) =>
      donation.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredDonations(filtered);
  }, [searchText, donations]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name,Amount,Date,Composite Key'];
    const rows = filteredDonations.map((donation) =>
      `${donation.name || 'Anonymous'},${donation.amount},"${donation.date || 'Not specified'}","${donation.compositeKey || 'N/A'}"`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Define table columns
  const columns: ColumnsType<Donation> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Donation, b: Donation) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <span style={{ fontWeight: 500 }}>{text || 'Anonymous'}</span>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: Donation, b: Donation) => a.amount - b.amount,
      render: (amount: number) => (
        <span style={{ color: '#1890ff' }}>${amount.toLocaleString()}</span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      sorter: (a: Donation, b: Donation) =>
        a.date.localeCompare(b.date || 'Not specified'),
      render: (date: string) => date || 'Not specified',
    },
    {
      title: 'Composite Key',
      dataIndex: 'compositeKey',
      key: 'compositeKey',
      render: (key: string) => key || 'N/A',
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
        components: {
          Table: {
            headerBg: darkMode ? '#1f1f1f' : '#fafafa',
            rowHoverBg: darkMode ? '#2a2a2a' : '#e6f7ff',
          },
          Card: {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        {/* Header */}
        <Header
          style={{
            background: darkMode ? '#141414' : '#fff',
            padding: '0 20px',
            borderBottom: darkMode ? '1px solid #2a2a2a' : '1px solid #e8e8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Title level={3} style={{ color: darkMode ? '#fff' : '#000', margin: 0 }}>
            Donations Dashboard
          </Title>
          <Space>
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<SunOutlined />}
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
          </Space>
        </Header>

        {/* Content */}
        <Content style={{ padding: '40px 20px', background: darkMode ? '#1a1a1a' : '#f0f2f5' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : (
              <Card
                style={{
                  borderRadius: 12,
                  background: darkMode ? '#262626' : '#fff',
                  transition: 'all 0.3s ease',
                }}
                bodyStyle={{ padding: '24px' }}
              >
                <Title
                  level={2}
                  style={{
                    color: darkMode ? '#fff' : '#000',
                    marginBottom: 24,
                    fontWeight: 600,
                  }}
                >
                  Donations
                </Title>
                <Space style={{ marginBottom: 16 }}>
                  <Input
                    placeholder="Search by name"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 300 }}
                  />
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={exportToCSV}
                  >
                    Export to CSV
                  </Button>
                </Space>
                <Table
                  columns={columns}
                  dataSource={filteredDonations}
                  rowKey="id"
                  pagination={{ pageSize: 5, showSizeChanger: true }}
                  bordered
                  scroll={{ x: true }}
                  style={{ borderRadius: 8, overflow: 'hidden' }}
                  rowClassName={() => 'table-row-animated'}
                  loading={loading}
                />
              </Card>
            )}
          </div>
        </Content>
      </Layout>

      {/* Inline CSS for animations */}
      <style jsx global>{`
        .table-row-animated {
          transition: background-color 0.3s ease;
        }
        .table-row-animated:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
      `}</style>
    </ConfigProvider>
  );
}