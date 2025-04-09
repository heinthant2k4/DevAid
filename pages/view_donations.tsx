'use client';

import React, { useState, useEffect } from 'react';
import { Button, Table, Typography, message, Skeleton, Card, Empty } from 'antd';
import Link from 'next/link';
import { collection, query, limit, startAfter, getDocs, orderBy, startAt, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { HomeOutlined, FileTextOutlined } from '@ant-design/icons';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const { Title } = Typography;

interface Donation {
  id: string;
  name: string;
  amount: number;
}

const PAGE_SIZE = 10;

const Donations: React.FC = () => {
  const [donationsData, setDonationsData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [totalLoading, setTotalLoading] = useState<boolean>(true);
  const [totalError, setTotalError] = useState<string | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<string | null>(null);

  // Fetch the total sum of all donations
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

  // Fetch donations from Firestore
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

  // Function to generate and download the certificate
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

  // Function to render the View Certificate button
  const renderCertificateButton = (record: Donation) => (
    <Button
      type="default"
      icon={<FileTextOutlined />}
      onClick={() => generateCertificate(record)}
      loading={certificateLoading === record.id}
      style={{
        backgroundColor: '#e6f7ff',
        color: '#1890ff',
        border: 'none',
        borderRadius: '4px',
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
      onCell: () => ({
        style: { color: '#000000', padding: '12px' },
      }),
      onHeaderCell: () => ({
        style: {
          color: '#000000',
          backgroundColor: '#e6f7ff',
          fontWeight: 600,
        },
      }),
    },
    {
      title: 'Amount (MMK)',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: Donation, b: Donation) => a.amount - b.amount,
      render: (amount: number) => (
        <span style={{ fontWeight: 500, color: '#389e0d' }}>
          {amount.toLocaleString()} MMK
        </span>
      ),
      onCell: () => ({
        style: { color: '#000000', padding: '12px' },
      }),
      onHeaderCell: () => ({
        style: {
          color: '#000000',
          backgroundColor: '#e6f7ff',
          fontWeight: 600,
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
          color: '#000000',
          backgroundColor: '#e6f7ff',
          fontWeight: 600,
        },
      }),
    },
  ];

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: '100vh',
    padding: '24px',
    fontFamily: 'var(--font-jetbrains-mono), monospace',
  };

  const buttonStyle: React.CSSProperties = {
    borderRadius: '8px',
    fontWeight: 500,
    padding: '8px 24px',
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      {/* Dev Aid Title */}
      <Title
        level={2}
        style={{
          color: '#1890ff',
          fontSize: '28px',
          fontWeight: 700,
          position: 'absolute',
          top: '24px',
          left: '24px',
          margin: 0,
        }}
      >
        Dev Aid
      </Title>

      {/* Header */}
      <Title
        level={1}
        style={{
          color: '#1a1a1a',
          fontSize: '36px',
          fontWeight: 700,
          marginBottom: '16px',
          textAlign: 'center',
        }}
      >
        Donations
      </Title>

      {/* Total Donations Card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        {totalLoading ? (
          <Skeleton active paragraph={{ rows: 2 }} style={{ width: '100%', maxWidth: 400 }} />
        ) : totalError ? (
          <div style={{ textAlign: 'center', maxWidth: 400, width: '100%' }}>
            <Typography.Paragraph style={{ color: '#ff4d4f', fontSize: '16px' }}>
              {totalError}
            </Typography.Paragraph>
            <Button
              type="primary"
              onClick={fetchTotalDonations}
              style={{ ...buttonStyle, backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#ffffff' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#40a9ff';
                e.currentTarget.style.borderColor = '#40a9ff';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#1890ff';
                e.currentTarget.style.borderColor = '#1890ff';
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
              border: '1px solid #e6f7ff',
            }}
            bodyStyle={{
              padding: '16px 24px',
            }}
          >
            <Title level={4} style={{ margin: 0, color: '#666666' }}>
              Thank you for your generous support!
            </Title>
            <Title level={3} style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
              Total Donations: {totalDonations.toLocaleString()} MMK
            </Title>
          </Card>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        {loading && !donationsData.length ? (
          <Skeleton active paragraph={{ rows: 5 }} style={{ padding: '16px' }} />
        ) : error ? (
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Typography.Paragraph style={{ color: '#ff4d4f', fontSize: '16px' }}>
              {error}
            </Typography.Paragraph>
            <Button
              type="primary"
              onClick={() => fetchDonations()}
              style={{ ...buttonStyle, backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#ffffff' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#40a9ff';
                e.currentTarget.style.borderColor = '#40a9ff';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#1890ff';
                e.currentTarget.style.borderColor = '#1890ff';
              }}
            >
              Retry
            </Button>
          </div>
        ) : donationsData.length === 0 ? (
          <Empty description="No donations found." />
        ) : (
          <Table
            columns={columns}
            dataSource={donationsData}
            rowKey="id"
            pagination={false}
            loading={loading}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
            rowClassName={(record, index) => (index % 2 === 0 ? 'light-row-even' : '')}
            onRow={(record, index) => ({
              onMouseEnter: (event: React.MouseEvent<HTMLTableRowElement>) => {
                const row = event.currentTarget;
                row.style.backgroundColor = '#e6f7ff';
              },
              onMouseLeave: (event: React.MouseEvent<HTMLTableRowElement>) => {
                const row = event.currentTarget;
                row.style.backgroundColor = index! % 2 === 0 ? '#fafafa' : '#ffffff';
              },
              style: {
                transition: 'background-color 0.2s ease',
              },
            })}
          />
        )}
      </div>

      {/* Pagination Buttons */}
      {donationsData.length > 0 && !error && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          {hasPrevious && (
            <Button
              onClick={() => fetchDonations(false, true)}
              loading={loading}
              style={{
                ...buttonStyle,
                marginRight: 8,
                backgroundColor: '#e6f7ff',
                borderColor: '#1890ff',
                color: '#1890ff',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#bae7ff';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
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
                backgroundColor: '#e6f7ff',
                borderColor: '#1890ff',
                color: '#1890ff',
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#bae7ff';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = '#e6f7ff';
              }}
            >
              Load More
            </Button>
          )}
        </div>
      )}

      {/* Back to Home Button */}
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
            backgroundColor: '#ffffff',
            color: '#000000',
            border: '1px solid #000000',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#e6f7ff';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default Donations;