'use client';

import React from 'react';
import { Button, Card, Space, Typography, Row, Col, Skeleton, message } from 'antd';
import { DollarOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useTheme } from '../components/theme'; // Import the useTheme hook from your theme.tsx

const { Title, Paragraph } = Typography;

interface Donation {
    id: string;
    name: string;
    amount: number;
    compositeKey: string;
}

const Home: React.FC = () => {
    const { isDarkMode, toggleTheme } = useTheme(); // Use the global theme context
    const [totalDonations, setTotalDonations] = React.useState<number>(0);
    const [totalDonated, setTotalDonated] = React.useState<number>(185000);
    const [totalDonors, setTotalDonors] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string | null>(null);

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

    React.useEffect(() => {
        fetchDonationStats();
    }, []);

    const containerStyle = {
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        minHeight: '100vh',
        padding: '24px',
        fontFamily: 'var(--font-jetbrains-mono), monospace',
        transition: 'background-color 0.3s ease, color 0.3s ease',
    };

    const cardStyle = {
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: isDarkMode ? '1px solid #333333' : '1px solid #e6f7ff',
        height: '100%',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
    };

    const statCardStyle = {
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        border: isDarkMode ? '1px solid #333333' : '1px solid #e6f7ff',
        textAlign: 'center' as const,
        backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
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
                    color: isDarkMode ? '#1890ff' : '#1890ff', // Keep blue for consistency
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

            {/* Theme Toggle Button */}
            <Button
                onClick={toggleTheme}
                shape="circle"
                icon={<EyeOutlined />} // Using EyeOutlined as a theme toggle icon
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000,
                    width: '50px',
                    height: '50px',
                    backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                    color: isDarkMode ? '#000000' : '#ffffff',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.5s ease, color 0.5s ease',
                }}
            />

            {/* Hero Section */}
            <section
                style={{
                    textAlign: 'center',
                    padding: '60px 20px 40px',
                    marginBottom: '40px',
                    borderBottom: isDarkMode ? '1px solid #333333' : '1px solid #ddd',
                    transition: 'border-color 0.3s ease',
                }}
            >
                <Title
                    level={1}
                    style={{
                        color: isDarkMode ? '#ffffff' : '#1a1a1a',
                        fontSize: '36px',
                        fontWeight: 700,
                        marginBottom: '15px',
                        transition: 'color 0.3s ease',
                    }}
                >
                    Myanmar Earthquake Relief Fund
                </Title>
                <Paragraph
                    style={{
                        fontSize: '16px',
                        maxWidth: '600px',
                        margin: '0 auto 30px',
                        color: isDarkMode ? '#cccccc' : '#666666',
                        lineHeight: '1.6',
                        transition: 'color 0.3s ease',
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
                            backgroundColor: isDarkMode ? '#40a9ff' : '#1890ff',
                            borderColor: isDarkMode ? '#40a9ff' : '#1890ff',
                            color: '#ffffff',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#66b1ff' : '#40a9ff';
                            e.currentTarget.style.borderColor = isDarkMode ? '#66b1ff' : '#40a9ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#40a9ff' : '#1890ff';
                            e.currentTarget.style.borderColor = isDarkMode ? '#40a9ff' : '#1890ff';
                        }}
                    >
                        <Link href="/donate">Donate Now</Link>
                    </Button>
                    <Button
                        size="large"
                        icon={<EyeOutlined />}
                        style={{
                            ...buttonStyle,
                            borderColor: isDarkMode ? '#ffffff' : '#000000',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#444444' : '#e6f7ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#333333' : '#ffffff';
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
                        <Card style={cardStyle} bodyStyle={{ padding: '16px 24px' }}>
                            <Title
                                level={3}
                                style={{
                                    color: isDarkMode ? '#ffffff' : '#1a1a1a',
                                    fontSize: '24px',
                                    marginBottom: '15px',
                                    fontWeight: 500,
                                    transition: 'color 0.3s ease',
                                }}
                            >
                                About the Earthquake
                            </Title>
                            <Paragraph
                                style={{
                                    fontSize: '14px',
                                    color: isDarkMode ? '#cccccc' : '#666666',
                                    lineHeight: '1.6',
                                    transition: 'color 0.3s ease',
                                }}
                            >
                                On March 28, 2025, a 7.7-magnitude earthquake hit Myanmar near Mandalay, followed by a 6.4-magnitude aftershock. It claimed over 3,000 lives, demolished infrastructure, and displaced thousands, worsening the crisis.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card style={cardStyle} bodyStyle={{ padding: '16px 24px' }}>
                            <Title
                                level={3}
                                style={{
                                    color: isDarkMode ? '#ffffff' : '#1a1a1a',
                                    fontSize: '24px',
                                    marginBottom: '15px',
                                    fontWeight: 500,
                                    transition: 'color 0.3s ease',
                                }}
                            >
                                Our Relief Efforts
                            </Title>
                            <Paragraph
                                style={{
                                    fontSize: '14px',
                                    color: isDarkMode ? '#cccccc' : '#666666',
                                    lineHeight: '1.6',
                                    transition: 'color 0.3s ease',
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
                        <Paragraph style={{ color: isDarkMode ? '#ff7875' : '#ff4d4f', fontSize: '16px', transition: 'color 0.3s ease' }}>
                            {error}
                        </Paragraph>
                        <Button
                            type="primary"
                            onClick={fetchDonationStats}
                            style={{
                                ...buttonStyle,
                                backgroundColor: isDarkMode ? '#40a9ff' : '#1890ff',
                                borderColor: isDarkMode ? '#40a9ff' : '#1890ff',
                                color: '#ffffff',
                            }}
                        >
                            Retry
                        </Button>
                    </div>
                ) : (
                    <Row gutter={[20, 20]} justify="center">
                        <Col xs={24} sm={8}>
                            <Card style={statCardStyle} bodyStyle={{ padding: '16px 24px' }}>
                                <Title level={4} style={{ margin: 0, color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.3s ease' }}>
                                    Total Donations
                                </Title>
                                <Title level={3} style={{ margin: '8px 0 0 0', color: isDarkMode ? '#b7eb8f' : '#389e0d', transition: 'color 0.3s ease' }}>
                                    {totalDonations.toLocaleString()} MMK
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card style={statCardStyle} bodyStyle={{ padding: '16px 24px' }}>
                                <Title level={4} style={{ margin: 0, color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.3s ease' }}>
                                    Total Donated
                                </Title>
                                <Title level={3} style={{ margin: '8px 0 0 0', color: isDarkMode ? '#b7eb8f' : '#389e0d', transition: 'color 0.3s ease' }}>
                                    {totalDonated.toLocaleString()} MMK
                                </Title>
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card style={statCardStyle} bodyStyle={{ padding: '16px 24px' }}>
                                <Title level={4} style={{ margin: 0, color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.3s ease' }}>
                                    Total Donors
                                </Title>
                                <Title level={3} style={{ margin: '8px 0 0 0', color: isDarkMode ? '#ffffff' : '#1a1a1a', transition: 'color 0.3s ease' }}>
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
                    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                    borderRadius: '10px',
                    transition: 'background-color 0.3s ease',
                }}
            >
                <Title
                    level={2}
                    style={{
                        color: isDarkMode ? '#ffffff' : '#1a1a1a',
                        marginBottom: '15px',
                        fontSize: '32px',
                        fontWeight: 600,
                        transition: 'color 0.3s ease',
                    }}
                >
                    Support the Recovery
                </Title>
                <Paragraph
                    style={{
                        fontSize: '16px',
                        maxWidth: '600px',
                        margin: '0 auto 30px',
                        color: isDarkMode ? '#cccccc' : '#666666',
                        lineHeight: '1.6',
                        transition: 'color 0.3s ease',
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
                            backgroundColor: isDarkMode ? '#40a9ff' : '#1890ff',
                            borderColor: isDarkMode ? '#40a9ff' : '#1890ff',
                            color: '#ffffff',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#66b1ff' : '#40a9ff';
                            e.currentTarget.style.borderColor = isDarkMode ? '#66b1ff' : '#40a9ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#40a9ff' : '#1890ff';
                            e.currentTarget.style.borderColor = isDarkMode ? '#40a9ff' : '#1890ff';
                        }}
                    >
                        <Link href="/donate">Donate Now</Link>
                    </Button>
                    <Button
                        size="large"
                        icon={<EyeOutlined />}
                        style={{
                            ...buttonStyle,
                            borderColor: isDarkMode ? '#ffffff' : '#000000',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#444444' : '#e6f7ff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#333333' : '#ffffff';
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