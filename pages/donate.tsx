'use client';

import React, { useState } from 'react';
import { Card, Row, Col, Typography, Modal, Button } from 'antd';
import { ArrowLeftOutlined, BulbOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';

const { Title, Paragraph } = Typography;

const DonatePage: React.FC = () => {
    const [modalVisible, setModalVisible] = useState({
        kbzPay: false,
        AYAPay: false,
        waveMoney: false,
        uab: false,
    });
    const [isDarkMode, setIsDarkMode] = useState(false); // New state for theme

    const accountNumbers = {
        kbzPay: '1234-5678-9012',
        AYAPay: '9876-5432-1098',
        waveMoney: '4567-8901-2345',
        uab: '3210-6548-7980',
    };

    const qrImages = {
        kbzPay: '/kpay-qr.png',
        AYAPay: '/aya-qr.png',
        waveMoney: '/wave-qr.png',
        uab: '/uab-qr.png',
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Base styles that change based on theme with transitions
    const containerStyle: React.CSSProperties = {
        background: isDarkMode ? '#000000' : '#ffffff',
        minHeight: '100vh',
        padding: '20px 10px',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        color: isDarkMode ? '#ffffff' : '#000000',
        textAlign: 'center' as const,
        transition: 'background 0.5s ease, color 0.5s ease', // Added transition
    };

    const cardStyle: React.CSSProperties = {
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '10px',
        textAlign: 'center' as const,
        width: '120px',
        height: '120px',
        transition: 'transform 0.3s ease, background 0.5s ease', // Updated transition
        background: isDarkMode ? '#2C2C2C' : '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: '0 auto',
        cursor: 'pointer',
    };

    const statCircleStyle: React.CSSProperties = {
        background: isDarkMode ? 'rgba(44, 44, 44, 0.8)' : 'rgba(200, 200, 200, 0.8)',
        borderRadius: '50%',
        width: '150px',
        height: '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        transition: 'background 0.5s ease', // Added transition
    };

    return (
        <div style={containerStyle}>
            {/* Website Title */}
            <Title
                level={2}
                style={{
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '28px',
                    fontWeight: '600',
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    margin: 0,
                    transition: 'color 0.5s ease', // Added transition
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
                    bottom: '20px', // Changed from top to bottom
                    right: '20px',  // Changed from right to left
                    zIndex: 1000,
                    width: '50px',
                    height: '50px',
                    backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                    color: isDarkMode ? '#000000' : '#ffffff',
                    border: 'none',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                    transition: 'background-color 0.5s ease, color 0.5s ease', // Added transition
                }}
            />
            {/* <button // Commented out instead of deleted
                onClick={toggleTheme}
                style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                    color: isDarkMode ? '#000000' : '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.5s ease, color 0.5s ease', // Added transition
                }}
            >
                {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button> */}

            {/* Header Section */}
            <section style={{ marginBottom: '40px', paddingTop: '40px' }}>
                <Title level={1} style={{
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '32px',
                    fontWeight: 700,
                    marginBottom: '15px',
                    letterSpacing: '-0.5px',
                    transition: 'color 0.5s ease', // Added transition
                }}>
                    DevAid
                </Title>
                <Paragraph style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#cccccc' : '#666666',
                    maxWidth: '300px',
                    margin: '0 auto',
                    lineHeight: '1.5',
                    transition: 'color 0.5s ease', // Added transition
                }}>
                    Your donation will provide essential resources, support communities in need, and empower individuals to build a brighter future. Every contribution makes a difference!
                </Paragraph>
            </section>

            {/* Payments Section */}
            <section style={{ marginBottom: '40px' }}>
                <Title level={2} style={{
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '30px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    opacity: 0.8,
                    transition: 'color 0.5s ease', // Added transition
                }}>
                    Payments
                </Title>
                <Row gutter={[10, 10]} justify="center" align="middle">
                    <Col xs={20} sm={12} md={5}>
                        <Card
                            style={cardStyle}
                            onClick={() => setModalVisible({ ...modalVisible, kbzPay: true })}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <Image src="/kpay.jpg" alt="KBZ Pay" width={60} height={60} style={{ marginBottom: '10px', width: '60px', height: '60px', objectFit: 'contain' }} />
                            <Paragraph style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000', margin: '0', fontWeight: 500, transition: 'color 0.5s ease' }}>KBZ Pay</Paragraph>
                        </Card>
                        <Modal
                            title="KBZ Pay Donation"
                            visible={modalVisible.kbzPay}
                            onCancel={() => setModalVisible({ ...modalVisible, kbzPay: false })}
                            footer={null}
                            centered
                            width={300}
                            style={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', transition: 'background 0.5s ease' }}
                            bodyStyle={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', color: isDarkMode ? '#ffffff' : '#000000', transition: 'background 0.5s ease, color 0.5s ease' }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Image src="/images/wkhs_kbz.jpg" alt="KBZ Pay QR Code" width={200} height={300} style={{ margin: '0 auto' }} />
                                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#ffffff' : '#000000', marginTop: '20px', transition: 'color 0.5s ease', padding: '20px' }}>
                                    09765127445 <br />
                                    Htet Yadanar Myo
                                </Paragraph>
                            </div>
                        </Modal>
                    </Col>
                    <Col xs={20} sm={12} md={5}>
                        <Card
                            style={cardStyle}
                            onClick={() => setModalVisible({ ...modalVisible, AYAPay: true })}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <Image src="/aya.png" alt="AYA Pay" width={60} height={60} style={{ marginBottom: '10px', width: '60px', height: '60px', objectFit: 'contain' }} />
                            <Paragraph style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000', margin: '0', fontWeight: 500, transition: 'color 0.5s ease' }}>AYA Pay</Paragraph>
                        </Card>
                        <Modal
                            title="AYA Pay Donation"
                            visible={modalVisible.AYAPay}
                            onCancel={() => setModalVisible({ ...modalVisible, AYAPay: false })}
                            footer={null}
                            centered
                            width={300}
                            style={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', transition: 'background 0.5s ease' }}
                            bodyStyle={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', color: isDarkMode ? '#ffffff' : '#000000', transition: 'background 0.5s ease, color 0.5s ease' }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Image src="/images/wkhs_aya.jpg" alt="AYA Pay QR Code" width={200} height={300} style={{ margin: '0 auto' }} />
                                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#ffffff' : '#000000', marginTop: '20px', transition: 'color 0.5s ease', padding: '20px' }}>
                                    09765127445 <br />
                                    Htet Yadanar Myo
                                </Paragraph>
                            </div>
                        </Modal>
                    </Col>
                    {/* <Col xs={20} sm={12} md={5}>
                        <Card
                            style={cardStyle}
                            onClick={() => setModalVisible({ ...modalVisible, waveMoney: true })}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <Image src="/wave.jpg" alt="Wave Money" width={30} height={30} style={{ marginBottom: '10px', width: '30px', height: '30px', objectFit: 'contain' }} />
                            <Paragraph style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000', margin: '0', fontWeight: 500, transition: 'color 0.5s ease' }}>Wave Money</Paragraph>
                        </Card>
                        <Modal
                            title="Wave Money Donation"
                            visible={modalVisible.waveMoney}
                            onCancel={() => setModalVisible({ ...modalVisible, waveMoney: false })}
                            footer={null}
                            centered
                            width={300}
                            style={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', transition: 'background 0.5s ease' }}
                            bodyStyle={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', color: isDarkMode ? '#ffffff' : '#000000', transition: 'background 0.5s ease, color 0.5s ease' }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Image src={qrImages.waveMoney} alt="Wave Money QR Code" width={200} height={200} style={{ margin: '0 auto' }} />
                                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#ffffff' : '#000000', marginTop: '20px', transition: 'color 0.5s ease' }}>
                                    Account Number: {accountNumbers.waveMoney}
                                </Paragraph>
                            </div>
                        </Modal>
                    </Col> */}
                    {/* <Col xs={20} sm={12} md={5}>
                        <Card
                            style={cardStyle}
                            onClick={() => setModalVisible({ ...modalVisible, uab: true })}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-5px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <Image src="/uab.png" alt="UAB" width={30} height={30} style={{ marginBottom: '10px', width: '30px', height: '30px', objectFit: 'contain' }} />
                            <Paragraph style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#000000', margin: '0', fontWeight: 500, transition: 'color 0.5s ease' }}>UAB</Paragraph>
                        </Card>
                        <Modal
                            title="UAB Donation"
                            visible={modalVisible.uab}
                            onCancel={() => setModalVisible({ ...modalVisible, uab: false })}
                            footer={null}
                            centered
                            width={300}
                            style={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', transition: 'background 0.5s ease' }}
                            bodyStyle={{ background: isDarkMode ? '#2C2C2C' : '#f0f0f0', color: isDarkMode ? '#ffffff' : '#000000', transition: 'background 0.5s ease, color 0.5s ease' }}
                        >
                            <div style={{ textAlign: 'center' }}>
                                <Image src={qrImages.uab} alt="UAB QR Code" width={200} height={200} style={{ margin: '0 auto' }} />
                                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#ffffff' : '#000000', marginTop: '20px', transition: 'color 0.5s ease' }}>
                                    Account Number: {accountNumbers.uab}
                                </Paragraph>
                            </div>
                        </Modal>
                    </Col> */}
                </Row>
            </section>

            {/* Total Donations and Donators Section */}
            {/* <section style={{ marginBottom: '40px' }}>
                <Row gutter={[20, 20]} justify="center" align="middle">
                    <Col xs={20} sm={10} md={6}>
                        <div style={statCircleStyle}>
                            <Paragraph style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '14px', margin: '0', transition: 'color 0.5s ease' }}>Total Donations</Paragraph>
                            <Title level={2} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '24px', margin: '5px 0', transition: 'color 0.5s ease' }}>500,000</Title>
                            <Paragraph style={{ color: isDarkMode ? '#cccccc' : '#666666', fontSize: '14px', margin: '0', transition: 'color 0.5s ease' }}>MMK</Paragraph>
                        </div>
                    </Col>
                    <Col xs={20} sm={10} md={6}>
                        <div style={statCircleStyle}>
                            <Paragraph style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '14px', margin: '0', transition: 'color 0.5s ease' }}>Total Donations</Paragraph>
                            <Title level={2} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '24px', margin: '5px 0', transition: 'color 0.5s ease' }}>75,000</Title>
                            <Paragraph style={{ color: isDarkMode ? '#cccccc' : '#666666', fontSize: '14px', margin: '0', transition: 'color 0.5s ease' }}>MMK</Paragraph>
                        </div>
                    </Col>
                    <Col xs={20} sm={10} md={6}>
                        <div style={statCircleStyle}>
                            <Paragraph style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '14px', margin: '0', transition: 'color 0.5s ease' }}>Total Donators</Paragraph>
                            <Title level={2} style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '24px', margin: '5px 0', transition: 'color 0.5s ease' }}>10</Title>
                        </div>
                    </Col>
                </Row>
            </section> */}

            {/* Back to Home Button at Bottom */}
            <section style={{ padding: '20px 0' }}>
                <Link href="/" passHref>
                    <button
                        style={{
                            backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
                            color: isDarkMode ? '#ffffff' : '#000000',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '25px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            transition: 'background-color 0.3s ease', // Original transition preserved
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                            transition: 'background-color 0.5s ease, color 0.5s ease', // Updated transition
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? '#4A4A4A' : '#cccccc')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDarkMode ? '#333333' : '#e0e0e0')}
                    >
                        <ArrowLeftOutlined style={{ marginRight: '6px', color: isDarkMode ? '#ffffff' : '#000000', transition: 'color 0.5s ease' }} /> Back to Home
                    </button>
                </Link>
            </section>
        </div>
    );
};

export default DonatePage;