'use client';

import React, { useEffect } from 'react';
import { Button, Table, Typography, message, Skeleton, Card, Empty } from 'antd';
import Link from 'next/link';
import { collection, query, limit, startAfter, getDocs, orderBy, startAt, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { useTheme } from '../components/theme';

const { Title } = Typography;

interface Donation {
  id: string;
  name: string;
  amount: number;
}

const PAGE_SIZE = 10;

const Donations: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [donationsData, setDonationsData] = React.useState<Donation[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [lastDoc, setLastDoc] = React.useState<DocumentSnapshot | null>(null);
  const [firstDoc, setFirstDoc] = React.useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = React.useState<boolean>(true);
  const [hasPrevious, setHasPrevious] = React.useState<boolean>(false);
  const [totalDonations, setTotalDonations] = React.useState<number>(0);
  const [totalLoading, setTotalLoading] = React.useState<boolean>(true);
  const [totalError, setTotalError] = React.useState<string | null>(null);
  const [certificateLoading, setCertificateLoading] = React.useState<string | null>(null);

  const fetchTotalDonations = async () => {
    try {
      setTotalLoading(true);
      setTotalError(null);
      const snapshot = await getDocs(collection(db, 'donations'));
      const total = snapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.amount || 0);
      }, 0);
      setTotalDonations(total);
    } catch (error) {
      console.error('Error fetching total donations:', error);
      setTotalError('Failed to fetch total donations. Please try again.');
      message.error('Failed to fetch total donations.');
    } finally {
      setTotalLoading(false);
    }
  };

  const fetchDonations = async (loadMore: boolean = false, loadPrevious: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      let q = query(collection(db, 'donations'), orderBy('amount', 'desc'), limit(PAGE_SIZE));

      if (loadMore && lastDoc) {
        q = query(collection(db, 'donations'), orderBy('amount', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      } else if (loadPrevious && firstDoc) {
        q = query(collection(db, 'donations'), orderBy('amount', 'desc'), startAt(firstDoc), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      console.log('Fetched documents:', snapshot.docs.length);

      const fetchedDonations = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.donorName || 'Unknown',
          amount: data.amount || 0,
        };
      });

      setDonationsData((prev) => {
        let newData: Donation[] = [];
        if (loadMore) {
          newData = [...prev, ...fetchedDonations];
        } else if (loadPrevious) {
          newData = [...fetchedDonations, ...prev];
        } else {
          newData = fetchedDonations;
        }
        return newData;
      });

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setFirstDoc(snapshot.docs[0] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setHasPrevious(donationsData.length > 0 && !loadMore);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to fetch donations. Please try again.');
      message.error('Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async (record: Donation) => {
    setCertificateLoading(record.id);
    try {
      const templateBytes = await fetch('/certi.pdf').then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(templateBytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.getPage(0);
      page.drawText(record.name, { x: 130, y: 275, size: 16, font, color: rgb(0, 0, 0) });
      page.drawText(`MMK ${record.amount.toLocaleString()}`, { x: 250, y: 355, size: 20, font, color: rgb(0, 0, 0) });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${record.name}_certificate.pdf`;
      link.click();
      message.success('Certificate generated successfully!');
    } catch (error) {
      console.error('Certificate error:', error);
      message.error('Failed to generate certificate. Please try again.');
    } finally {
      setCertificateLoading(null);
    }
  };

  const renderCertificateButton = (record: Donation) => (
    <Button
      type="default"
      icon={<FileTextOutlined />}
      onClick={() => generateCertificate(record)}
      loading={certificateLoading === record.id}
      style={{
        backgroundColor: isDarkMode ? '#333333' : '#e6f7ff',
        color: isDarkMode ? '#ffffff' : '#1890ff',
        border: 'none',
        borderRadius: '4px',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      View Certificate
    </Button>
  );

  useEffect(() => {
    fetchTotalDonations();
    fetchDonations();
  }, []);

  const columns = [
    {
      title: 'Donor Name',
      dataIndex: 'name',
      key: 'name',
      onCell: (record, index) => ({
        style: {
          color: isDarkMode ? '#000000' : '#000000', // Black text in dark mode
          backgroundColor: isDarkMode ? '#ffffff' : (index! % 2 === 0 ? '#fafafa' : '#ffffff'),
          padding: '12px',
          transition: 'color 0.3s ease, background-color 0.3s ease',
        },
      }),
      onHeaderCell: () => ({
        style: {
          color: isDarkMode ? '#ffffff' : '#000000',
          backgroundColor: isDarkMode ? '#000000' : '#e6f7ff',
          fontWeight: 600,
          transition: 'color 0.3s ease, background-color 0.3s ease',
        },
      }),
    },
    {
      title: 'Amount (MMK)',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: Donation, b: Donation) => a.amount - b.amount,
      render: (amount: number) => (
        <span style={{ fontWeight: 500, color: isDarkMode ? '#b7eb8f' : '#389e0d', transition: 'color 0.3s ease' }}>
          {amount.toLocaleString()} MMK
        </span>
      ),
      onCell: () => ({
        style: { color: isDarkMode ? '#ffffff' : '#000000', padding: '12px', transition: 'color 0.3s ease' },
      }),
      onHeaderCell: () => ({
        style: {
          color: isDarkMode ? '#ffffff' : '#000000',
          backgroundColor: isDarkMode ? '#000000' : '#e6f7ff',
          fontWeight: 600,
          transition: 'color 0.3s ease, background-color 0.3s ease',
        },
      }),
    },
    {
      title: 'Certificate',
      key: 'certificate',
      render: (_: any, record: Donation) => renderCertificateButton(record),
      onCell: () => ({
        style: { padding: '12px' },
      }),
      onHeaderCell: () => ({
        style: {
          color: isDarkMode ? '#ffffff' : '#000000',
          backgroundColor: isDarkMode ? '#000000' : '#e6f7ff',
          fontWeight: 600,
          transition: 'color 0.3s ease, background-color 0.3s ease',
        },
      }),
    },
  ];

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#000000',
    minHeight: '100vh',
    padding: '24px',
    fontFamily: 'var(--font-jetbrains-mono), monospace',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const buttonStyle: React.CSSProperties = {
    borderRadius: '8px',
    fontWeight: 500,
    padding: '8px 24px',
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <Title
        level={2}
        style={{
          color: isDarkMode ? '#1890ff' : '#1890ff',
          fontSize: '28px',
          fontWeight: 700,
          position: 'absolute',
          top: '24px',
          left: '24px',
          margin: 0,
          transition: 'color 0.3s ease',
        }}
      >
        DevAid
      </Title>

      <Title
        level={1}
        style={{
          color: isDarkMode ? '#ffffff' : '#1a1a1a',
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '16px',
          textAlign: 'center',
          transition: 'color 0.3s ease',
        }}
      >
        Donations
      </Title>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        {totalLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} style={{ width: '100%', maxWidth: 400 }} />
        ) : totalError ? (
          <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
            <Typography.Paragraph style={{ color: isDarkMode ? '#ff7875' : '#ff4d4f', fontSize: '16px', transition: 'color 0.3s ease' }}>
              {totalError}
            </Typography.Paragraph>
            <Button
              type="primary"
              onClick={fetchTotalDonations}
              style={{
                ...buttonStyle,
                backgroundColor: isDarkMode ? '#40a9ff' : '#1890ff',
                borderColor: isDarkMode ? '#40a9ff' : '#1890ff',
                color: '#ffffff',
              }}
              onMouseEnter={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#40a9ff';
                e.currentTarget.style.borderColor = '#40a9ff';
              }}
              onMouseLeave={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#40a9ff' : '#1890ff';
                e.currentTarget.style.borderColor = isDarkMode ? '#40a9ff' : '#1890ff';
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Card
            style={{
              width: '100%',
              maxWidth: 400,
              textAlign: 'center',
              borderRadius: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              border: isDarkMode ? '1px solid #333333' : '1px solid #e6f7ff',
              backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#000000',
              transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
            }}
            bodyStyle={{ padding: '16px 24px' }}
          >
            <Title level={4} style={{ margin: 0, color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.3s ease' }}>
              Thank you for your generous support!
            </Title>
            <Title level={3} style={{ margin: '8px 0 0 0', color: isDarkMode ? '#b7eb8f' : '#389e0d', transition: 'color 0.3s ease' }}>
              Total Donations: {totalDonations.toLocaleString()} MMK
            </Title>
          </Card>
        )}
      </div>

      <div style={{ overflowX: 'auto' }}>
        {loading && !donationsData.length ? (
          <Skeleton active paragraph={{ rows: 5 }} style={{ padding: '16px' }} />
        ) : error ? (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Typography.Paragraph style={{ color: isDarkMode ? '#ff7875' : '#ff4d4f', fontSize: '16px', transition: 'color 0.3s ease' }}>
              {error}
            </Typography.Paragraph>
            <Button
              type="primary"
              onClick={() => fetchDonations()}
              style={{
                ...buttonStyle,
                backgroundColor: isDarkMode ? '#40a9ff' : '#1890ff',
                borderColor: isDarkMode ? '#40a9ff' : '#1890ff',
                color: '#ffffff',
              }}
              onMouseEnter={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#40a9ff';
                e.currentTarget.style.borderColor = '#40a9ff';
              }}
              onMouseLeave={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = isDarkMode ? '#40a9ff' : '#1890ff';
                e.currentTarget.style.borderColor = isDarkMode ? '#40a9ff' : '#1890ff';
              }}
            >
              Retry
            </Button>
          </div>
        ) : donationsData.length === 0 ? (
          <Empty description="No donations found." style={{ color: isDarkMode ? '#ffffff' : '#000000', transition: 'color 0.3s ease' }} />
        ) : (
          <Table
            columns={columns}
            dataSource={donationsData}
            rowKey="id"
            pagination={false}
            loading={loading}
            style={{
              backgroundColor: isDarkMode ? '#000000' : '#ffffff',
              borderRadius: '8px',
              overflow: 'hidden',
              color: isDarkMode ? '#ffffff' : '#000000',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
            rowClassName={(record, index) => (isDarkMode ? '' : index % 2 === 0 ? 'light-row-even' : '')}
            onRow={(record, index) => ({
              onMouseEnter: isDarkMode ? undefined : (event: React.MouseEvent<HTMLTableRowElement>) => {
                const row = event.currentTarget;
                row.style.backgroundColor = '#e6f7ff';
              },
              onMouseLeave: isDarkMode ? undefined : (event: React.MouseEvent<HTMLTableRowElement>) => {
                const row = event.currentTarget;
                row.style.backgroundColor = index! % 2 === 0 ? '#fafafa' : '#ffffff';
              },
              style: {
                backgroundColor: isDarkMode ? '#ffffff' : (index! % 2 === 0 ? '#fafafa' : '#ffffff'),
                transition: 'background-color 0.2s ease',
              },
            })}
            onHeaderRow={() => ({
              style: {
                backgroundColor: isDarkMode ? '#000000' : '#e6f7ff',
                color: isDarkMode ? '#ffffff' : '#000000',
                transition: 'background-color 0.3s ease, color 0.3s ease',
              },
            })}
          />
        )}
      </div>

      {donationsData.length > 0 && !error && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          {hasPrevious && (
            <Button
              onClick={() => fetchDonations(false, true)}
              loading={loading}
              style={{
                ...buttonStyle,
                marginRight: 8,
                backgroundColor: isDarkMode ? '#333333' : '#e6f7ff',
                borderColor: isDarkMode ? '#40a9ff' : '#1890ff',
                color: isDarkMode ? '#ffffff' : '#1890ff',
                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#bae7ff';
              }}
              onMouseLeave={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#e6f7ff';
              }}
            >
              Load Previous
            </Button>
          )}
          {hasMore && (
            <Button
              onClick={() => fetchDonations(true)}
              loading={loading}
              style={{
                ...buttonStyle,
                backgroundColor: isDarkMode ? '#333333' : '#e6f7ff',
                borderColor: isDarkMode ? '#40a9ff' : '#1890ff',
                color: isDarkMode ? '#ffffff' : '#1890ff',
                transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
              }}
              onMouseEnter={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#bae7ff';
              }}
              onMouseLeave={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#e6f7ff';
              }}
            >
              Load More
            </Button>
          )}
        </div>
      )}

      <Link href="/">
        <Button
          type="default"
          icon={<HomeOutlined />}
          style={{
            ...buttonStyle,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '40px auto',
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            border: isDarkMode ? '1px solid #ffffff' : '1px solid #000000',
            transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
          }}
          onMouseEnter={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#e6f7ff';
          }}
          onMouseLeave={isDarkMode ? undefined : (e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

// Define CSS styles
const styles = `
  .light-row-even {
    background-color: #fafafa;
  }
`;

// Inject styles into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

export default Donations;