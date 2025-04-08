'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography, Row, Col } from 'antd';
import { DollarOutlined, EyeOutlined, BulbOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
    const [totalFunds, setTotalFunds] = useState(75000);
    const [totalDonors, setTotalDonors] = useState(1200);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // In a real scenario, fetch from Firebase or API
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const containerStyle = {
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'var(--font-jetbrains-mono)',
        position: 'relative',
    };

    const cardStyle = {
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
        border: 'none',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '20px',
        textAlign: 'left',
        height: '100%',
    };

    const statCircleStyle = {
        backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
        borderRadius: '50%',
        width: '150px',
        height: '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
        margin: '10px auto',
        fontSize: '16px',
        color: isDarkMode ? '#ffffff' : '#000000',
    };

    return (
        <div style={containerStyle}>
            {/* Website Title */}
            <Title
                level={2}
                style={{
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '28px',
                    fontWeight: 600,
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    margin: 0
                }}
            >
                DevAid
            </Title>

            {/* Theme Toggle Button */}
            <Button
                onClick={toggleTheme}
                shape="circle"
                icon={<BulbOutlined />}
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
                }}
            />

            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '60px 20px 40px', // Increased top padding to accommodate title
                marginBottom: '40px',
                borderBottom: isDarkMode ? '1px solid #333' : '1px solid #ddd'
            }}>
                <Title level={1} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '36px', fontWeight: 600, marginBottom: '15px' }}>
                    Myanmar Earthquake Relief Fund
                </Title>
                <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto 30px', color: isDarkMode ? '#ffffff' : '#000000', lineHeight: '1.6' }}>
                    Led by UIT, we provide emergency aid and recovery support for Myanmar’s earthquake victims, partnering with local and global organizations.
                </Paragraph>
                <Space size="large" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<DollarOutlined />}
                        style={{
                            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                            borderColor: isDarkMode ? '#000000' : '#000000',
                            color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                    >
                        <Link href="/donate">Donate Now</Link>
                    </Button>
                    <Button
                        size="large"
                        icon={<EyeOutlined />}
                        style={{
                            borderColor: isDarkMode ? '#ffffff' : '#000000',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            backgroundColor: isDarkMode ? '#000000' : '#ffffff'
                        }}
                    >
                        <Link href="/view_donations">View Donations</Link>
                    </Button>
                </Space>
            </section>

            {/* Earthquake & Relief Efforts Section */}
            <section style={{ marginBottom: '40px' }}>
                <Row gutter={[20, 20]} justify="center">
                    <Col xs={24} sm={12}>
                        <Card style={cardStyle}>
                            <Title level={3} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '28px', marginBottom: '15px', fontWeight: 500 }}>
                                About the Earthquake
                            </Title>
                            <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666', lineHeight: '1.6' }}>
                                On March 28, 2025, a 7.7-magnitude earthquake hit Myanmar near Mandalay, followed by a 6.4-magnitude aftershock. It claimed over 3,000 lives, demolished infrastructure, and displaced thousands, worsening the crisis.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Card style={cardStyle}>
                            <Title level={3} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '28px', marginBottom: '15px', fontWeight: 500 }}>
                                Our Relief Efforts
                            </Title>
                            <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666', lineHeight: '1.6' }}>
                                UIT’s team delivers food, medical camps, and shelters, collaborating with local NGOs and aiding mental health and education for affected children.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Impact Stats */}
            <section style={{ textAlign: 'center', marginBottom: '40px' }}>
                <Row gutter={[20, 20]} justify="center">
                    <Col xs={24} sm={8}>
                        <div style={statCircleStyle}>
                            <Typography.Text style={{ fontSize: '16px', color: isDarkMode ? '#cccccc' : '#666666' }}>
                                Total Donations
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: '24px', fontWeight: 600 }}>
                                500,000
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666' }}>
                                MMK
                            </Typography.Text>
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div style={statCircleStyle}>
                            <Typography.Text style={{ fontSize: '16px', color: isDarkMode ? '#cccccc' : '#666666' }}>
                                Total Donated
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: '24px', fontWeight: 600 }}>
                                {totalFunds.toLocaleString()}
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666' }}>
                                MMK
                            </Typography.Text>
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div style={statCircleStyle}>
                            <Typography.Text style={{ fontSize: '16px', color: isDarkMode ? '#cccccc' : '#666666' }}>
                                Total Donators
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: '24px', fontWeight: 600 }}>
                                {totalDonors.toLocaleString()}
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666' }}>
                            </Typography.Text>
                        </div>
                    </Col>
                </Row>
            </section>

            {/* Call to Action */}
            <section style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                color: isDarkMode ? '#ffffff' : '#000000',
                borderRadius: '10px'
            }}>
                <Title level={2} style={{ color: isDarkMode ? '#ffffff' : '#000000', marginBottom: '15px', fontSize: '32px', fontWeight: 600 }}>
                    Support the Recovery
                </Title>
                <Paragraph style={{ fontSize: '16px', maxWidth: '600px', margin: '0 auto 30px', color: isDarkMode ? '#ffffff' : '#000000', lineHeight: '1.6' }}>
                    Your donation aids earthquake victims in Myanmar with essentials and recovery support.
                </Paragraph>
                <Space size="large" style={{ flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<DollarOutlined />}
                        style={{
                            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                            borderColor: isDarkMode ? '#000000' : '#000000',
                            color: isDarkMode ? '#ffffff' : '#000000'
                        }}
                    >
                        <Link href="/donate">Donate Now</Link>
                    </Button>
                    <Button
                        size="large"
                        icon={<EyeOutlined />}
                        style={{
                            borderColor: isDarkMode ? '#ffffff' : '#000000',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            backgroundColor: isDarkMode ? '#000000' : '#ffffff'
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