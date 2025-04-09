'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Modal, Button, Form, Input, message } from 'antd';
import { ArrowLeftOutlined, BulbOutlined, KeyOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { HomeOutlined } from '@ant-design/icons';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Firebase imports
import { db } from '@/lib/firebaseClient'; // Import Firebase client
const { Title, Paragraph } = Typography;

const DonatePage: React.FC = () => {
    const [modalVisible, setModalVisible] = useState({
        kbzPay: false,
        AYAPay: false,
        waveMoney: false,
        uab: false,
        transactionKey: false,
    });
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [uniqueKey, setUniqueKey] = useState(''); // State to store the generated key
    const [form] = Form.useForm();

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

    // Generate a unique key when the component mounts
    useEffect(() => {
        const generateUniqueKey = () => {
            if (crypto?.randomUUID) {
                return crypto.randomUUID();
            }
            return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        };
        const key = generateUniqueKey();
        setUniqueKey(key);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // Function to store the unique key in Firebase
    const storeUniqueKey = async (paymentMethod: string) => {
        try {
            const donationKeyData = {
                uniqueKey,
                paymentMethod,
                timestamp: new Date().toISOString(),
                status: 'pending', // You can update this status later (e.g., after verification)
            };
            await addDoc(collection(db, 'donationKeys'), donationKeyData);
            message.success('Donation key stored successfully!');
        } catch (error) {
            console.error('Error storing unique key:', error);
            message.error('Failed to store donation key.');
        }
    };

    // Handle form submission to verify the transaction key
    const handleKeySubmit = async (values: { transactionKey: string }) => {
        const { transactionKey } = values;
        try {
            // Query Firebase to check if the key exists
            const q = query(collection(db, 'donationKeys'), where('uniqueKey', '==', transactionKey));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const data = doc.data();
                message.success(`Transaction key is valid! Payment method: ${data.paymentMethod}`);
                // Optionally, update the status in Firebase to 'verified'
                // await updateDoc(doc.ref, { status: 'verified' });
            } else {
                message.error('Invalid transaction key. Please try again.');
            }
        } catch (error) {
            console.error('Error verifying transaction key:', error);
            message.error('Error verifying transaction key. Please try again.');
        }
        setModalVisible({ ...modalVisible, transactionKey: false });
        form.resetFields();
    };

    // Base styles that change based on theme with transitions
    const containerStyle: React.CSSProperties = {
        background: isDarkMode ? '#000000' : '#ffffff',
        minHeight: '100vh',
        padding: '20px 10px',
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        color: isDarkMode ? '#ffffff' : '#000000',
        textAlign: 'center' as const,
        transition: 'background 0.5s ease, color 0.5s ease',
    };

    const cardStyle: React.CSSProperties = {
        border: 'none',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '10px',
        textAlign: 'center' as const,
        width: '120px',
        height: '120px',
        transition: 'transform 0.3s ease, background 0.5s ease',
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
        transition: 'background 0.5s ease',
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
                    transition: 'color 0.5s ease',
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
                    transition: 'background-color 0.5s ease, color 0.5s ease',
                }}
            />

            {/* Header Section */}
            <section style={{ marginBottom: '40px', paddingTop: '40px' }}>
                <Title level={1} style={{
                    color: isDarkMode ? '#ffffff' : '#000000',
                    fontSize: '32px',
                    fontWeight: 700,
                    marginBottom: '15px',
                    letterSpacing: '-0.5px',
                    transition: 'color 0.5s ease',
                }}>
                    DevAid
                </Title>
                <Paragraph style={{
                    fontSize: '14px',
                    color: isDarkMode ? '#cccccc' : '#666666',
                    maxWidth: '300px',
                    margin: '0 auto',
                    lineHeight: '1.5',
                    transition: 'color 0.5s ease',
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
                    transition: 'color 0.5s ease',
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
                            onCancel={() => {
                                setModalVisible({ ...modalVisible, kbzPay: false });
                                storeUniqueKey('KBZ Pay'); // Store the key when the modal is closed
                            }}
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
                                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#ffffff' : '#000000', marginTop: '10px', transition: 'color 0.5s ease' }}>
                                    Unique Key: <strong>{uniqueKey}</strong>
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
                            onCancel={() => {
                                setModalVisible({ ...modalVisible, AYAPay: false });
                                storeUniqueKey('AYA Pay'); // Store the key when the modal is closed
                            }}
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
                                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#ffffff' : '#000000', marginTop: '10px', transition: 'color 0.5s ease' }}>
                                    Unique Key: <strong>{uniqueKey}</strong>
                                </Paragraph>
                            </div>
                        </Modal>
                    </Col>
                </Row>
            </section>

            {/* Submit Transaction Key Button */}
           

            {/* Back to Home Button */}
            <Link href="/">
                <Button
                    type="default"
                    icon={<HomeOutlined />}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px 24px',
                        margin: '20px auto 60px auto',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        border: '1px solid #000000',
                        borderRadius: '8px',
                        fontWeight: '500',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                    }}
                >
                    Back to Home
                </Button>
            </Link>
        </div>
    );
};

export default DonatePage;