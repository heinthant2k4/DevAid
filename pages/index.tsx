'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography, Row, Col, Skeleton, message } from 'antd';
import { DollarOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

const { Title, Paragraph } = Typography;

interface Donation {
  id: string;
  name: string;
  amount: number;
  compositeKey: string;
}

const Home: React.FC = () => {
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [totalDonated, setTotalDonated] = useState<number>(185000);
  const [totalDonors, setTotalDonors] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Firestore on component mount
  const fetchDonationStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const snapshot = await getDocs(collection(db, 'donations'));
      const donations: Donation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.data().donorName || 'Unknown',
        amount: doc.data().amount || 0,
        compositeKey: doc.data().compositeKey || 'N/A',
      }));

      // Calculate total donations (sum of amounts)
      const sum = donations.reduce((acc, donation) => acc + (Number(donation.amount) || 0), 0);
      setTotalDonations(sum);

      // Set total donors (count of unique donors)
      const uniqueDonors = new Set(donations.map((donation) => donation.name || 'Anonymous')).size;
      setTotalDonors(uniqueDonors);

      console.log('Fetched donations:', donations);
      console.log('Total donations:', sum);
      console.log('Total donors:', uniqueDonors);
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      setError('Failed to fetch donation stats. Please try again.');
      message.error('Failed to fetch donation stats.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationStats();
  }, []);

  const containerStyle = {
    backgroundColor: '#ffffff',
    color: '#000000',
    minHeight: '100vh',
    padding: '24px',
    fontFamily: 'var(--font-jetbrains-mono), monospace',
  };

  const cardStyle = {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e6f7ff',
    height: '100%',
  };

  const statCardStyle = {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e6f7ff',
    textAlign: 'center' as const,
  };

  const buttonStyle = {
    borderRadius: '8px',
    fontWeight: 500,
    padding: '8px 24px',
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
  };

return (
    <div style={containerStyle}>
        {/* Website Title */}
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
            DevAid
        </Title>

        {/* Hero Section */}
        <section
            style={{
                textAlign: 'center',
                padding: '60px 20px 40px',
                marginBottom: '40px',
                borderBottom: '1px solid #ddd',
            }}
        >
            <Title
                level={1}
                style={{
                    color: '#1a1a1a',
                    fontSize: '36px',
                    fontWeight: 700,
                    marginBottom: '15px',
                }}
            >
                Myanmar Earthquake Relief Fund
            </Title>
            <Paragraph
                style={{
                    fontSize: '16px',
                    maxWidth: '600px',
                    margin: '0 auto 30px',
                    color: '#666666',
                    lineHeight: '1.6',
                }}
            >
                DevAid, a passionate student organization from UIT, is dedicated to making a difference. We provide emergency aid and recovery support to Myanmar's earthquake victims, helping people rebuild their lives with hope and dignity.
            </Paragraph>
            <Space size="large" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
                <Button
                    type="primary"
                    size="large"
                    icon={<DollarOutlined />}
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                        color: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#40a9ff';
                        e.currentTarget.style.borderColor = '#40a9ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1890ff';
                        e.currentTarget.style.borderColor = '#1890ff';
                    }}
                >
                    <Link href="/donate">Donate Now</Link>
                </Button>
                <Button
                    size="large"
                    icon={<EyeOutlined />}
                    style={{
                        ...buttonStyle,
                        borderColor: '#000000',
                        color: '#000000',
                        backgroundColor: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e6f7ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                >
                    <Link href="/view_donations">View Donations</Link>
                </Button>
            </Space>
        </section>

        {/* Earthquake & Relief Efforts Section */}
        <section style={{ marginBottom: '40px' }}>
            <Row gutter={[20, 20]} justify="center">
                <Col xs={24} sm={12} md={8}>
                    <Card style={{ ...cardStyle, height: '100%' }} bodyStyle={{ padding: '16px 24px' }}>
                        <Title
                            level={3}
                            style={{
                                color: '#1a1a1a',
                                fontSize: '24px',
                                marginBottom: '15px',
                                fontWeight: 500,
                            }}
                        >
                            About the Earthquake
                        </Title>
                        <Paragraph
                            style={{
                                fontSize: '14px',
                                color: '#666666',
                                lineHeight: '1.6',
                            }}
                        >
                            On March 28, 2025, a 7.7-magnitude earthquake hit Myanmar near Mandalay, followed by a 6.4-magnitude aftershock. It claimed over 3,000 lives, demolished infrastructure, and displaced thousands, worsening the crisis.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card style={{ ...cardStyle, height: '100%' }} bodyStyle={{ padding: '16px 24px' }}>
                        <Title
                            level={3}
                            style={{
                                color: '#1a1a1a',
                                fontSize: '24px',
                                marginBottom: '15px',
                                fontWeight: 500,
                            }}
                        >
                            Our Relief Efforts
                        </Title>
                        <Paragraph
                            style={{
                                fontSize: '14px',
                                color: '#666666',
                                lineHeight: '1.6',
                            }}
                        >
                            DevAid’s team delivers food, medical camps, and shelters, collaborating with local NGOs and aiding mental health and education for affected children.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>
        </section>

        {/* Impact Stats */}
        <section style={{ textAlign: 'center', marginBottom: '40px' }}>
            {loading ? (
                <Row gutter={[20, 20]} justify="center">
                    <Col xs={24} sm={8}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </Col>
                    <Col xs={24} sm={8}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </Col>
                </Row>
            ) : error ? (
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Paragraph style={{ color: '#ff4d4f', fontSize: '16px' }}>
                        {error}
                    </Paragraph>
                    <Button
                        type="primary"
                        onClick={fetchDonationStats}
                        style={{ ...buttonStyle, backgroundColor: '#1890ff', borderColor: '#1890ff', color: '#ffffff' }}
                    >
                        Retry
                    </Button>
                </div>
            ) : (
                <Row gutter={[20, 20]} justify="center">
                    <Col xs={24} sm={8}>
                        <Card style={{ ...statCardStyle, height: '100%' }} bodyStyle={{ padding: '16px 24px' }}>
                            <Title level={4} style={{ margin: 0, color: '#666666' }}>
                                Total Donations
                            </Title>
                            <Title level={3} style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
                                {totalDonations.toLocaleString()} MMK
                            </Title>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card style={{ ...statCardStyle, height: '100%' }} bodyStyle={{ padding: '16px 24px' }}>
                            <Title level={4} style={{ margin: 0, color: '#666666' }}>
                                Total Donated
                            </Title>
                            <Title level={3} style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
                                {totalDonated.toLocaleString()} MMK
                            </Title>
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card style={{ ...statCardStyle, height: '100%' }} bodyStyle={{ padding: '16px 24px' }}>
                            <Title level={4} style={{ margin: 0, color: '#666666' }}>
                                Total Donors
                            </Title>
                            <Title level={3} style={{ margin: '8px 0 0 0', color: '#1a1a1a' }}>
                                {totalDonors.toLocaleString()}
                            </Title>
                        </Card>
                    </Col>
                </Row>
            )}
        </section>

        {/* Call to Action */}
        <section
            style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
            }}
        >
            <Title
                level={2}
                style={{
                    color: '#1a1a1a',
                    marginBottom: '15px',
                    fontSize: '32px',
                    fontWeight: 600,
                }}
            >
                Support the Recovery
            </Title>
            <Paragraph
                style={{
                    fontSize: '16px',
                    maxWidth: '600px',
                    margin: '0 auto 30px',
                    color: '#666666',
                    lineHeight: '1.6',
                }}
            >
                Your donation aids earthquake victims in Myanmar with essentials and recovery support.
            </Paragraph>
            <Space size="large" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
                <Button
                    type="primary"
                    size="large"
                    icon={<DollarOutlined />}
                    style={{
                        ...buttonStyle,
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                        color: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#40a9ff';
                        e.currentTarget.style.borderColor = '#40a9ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#1890ff';
                        e.currentTarget.style.borderColor = '#1890ff';
                    }}
                >
                    <Link href="/donate">Donate Now</Link>
                </Button>
                <Button
                    size="large"
                    icon={<EyeOutlined />}
                    style={{
                        ...buttonStyle,
                        borderColor: '#000000',
                        color: '#000000',
                        backgroundColor: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e6f7ff';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                >
                    <Link href="/view_donations">View Donations</Link>
                </Button>
            </Space>
        </section>
    </div>
);
};

export default Home;