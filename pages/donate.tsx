'use client';

import React, { useEffect } from 'react';
import { Card, Row, Col, Typography, Modal, Button, Form, Input, message, Spin } from 'antd';
import { HomeOutlined, KeyOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useTheme } from '../components/theme'; // Import the useTheme hook from your theme.tsx

const { Title, Paragraph } = Typography;

const DonatePage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Use the global theme context
  const [modalVisible, setModalVisible] = React.useState({
    kbzPay: false,
    AYAPay: false,
    transactionKey: false,
  });
  const [uniqueKey, setUniqueKey] = React.useState<string>('');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const accountNumbers = {
    kbzPay: '1234-5678-9012',
    AYAPay: '9876-5432-1098',
  };

  const qrImages = {
    kbzPay: '/images/wkhs_kbz.jpg',
    AYAPay: '/images/wkhs_aya.jpg',
  };

  // Generate a unique key when the component mounts
  useEffect(() => {
    const generateUniqueKey = (): string => {
      if (crypto?.randomUUID) {
        return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    };
    const key = generateUniqueKey();
    setUniqueKey(key);
  }, []);

  // Function to store the unique key in Firebase
  const storeUniqueKey = async (paymentMethod: string) => {
    try {
      const donationKeyData = {
        uniqueKey,
        paymentMethod,
        timestamp: new Date().toISOString(),
        status: 'pending',
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
    setSubmitting(true);
    try {
      const q = query(collection(db, 'donationKeys'), where('uniqueKey', '==', transactionKey));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        message.success(`Transaction key is valid! Payment method: ${data.paymentMethod}`);
      } else {
        message.error('Invalid transaction key. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying transaction key:', error);
      message.error('Error verifying transaction key. Please try again.');
    } finally {
      setSubmitting(false);
      setModalVisible({ ...modalVisible, transactionKey: false });
      form.resetFields();
    }
  };

  // Copy unique key to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(uniqueKey).then(() => {
      message.success('Unique key copied to clipboard!');
    }).catch(() => {
      message.error('Failed to copy unique key.');
    });
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
    minHeight: '100vh',
    padding: '24px',
    fontFamily: 'var(--font-jetbrains-mono), monospace',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    textAlign: 'center',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  };

  const cardStyle: React.CSSProperties = {
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: isDarkMode ? '1px solid #333333' : '1px solid #e6f7ff',
    padding: '10px',
    textAlign: 'center',
    width: '120px',
    height: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '0 auto',
    cursor: 'pointer',
    backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
    color: isDarkMode ? '#ffffff' : '#1a1a1a',
    transition: 'transform 0.3s ease, background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
  };

  const buttonStyle: React.CSSProperties = {
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

      {/* Header Section */}
      <section style={{ marginBottom: '40px', paddingTop: '40px' }}>
        <Title
          level={1}
          style={{
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '15px',
            letterSpacing: '-0.5px',
            transition: 'color 0.3s ease',
          }}
        >
          Donate to DevAid
        </Title>
        <Paragraph
          style={{
            fontSize: '16px',
            color: isDarkMode ? '#cccccc' : '#666666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            transition: 'color 0.3s ease',
          }}
        >
          Your donation will provide essential resources, support communities in need, and empower individuals to build a brighter future. Every contribution makes a difference!
        </Paragraph>
      </section>

      {/* Payments Section */}
      <section style={{ marginBottom: '40px' }}>
        <Title
          level={2}
          style={{
            color: isDarkMode ? '#ffffff' : '#1a1a1a',
            fontSize: '24px',
            fontWeight: 600,
            marginBottom: '30px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'color 0.3s ease',
          }}
        >
          Payment Methods
        </Title>
        <Row gutter={[20, 20]} justify="center" align="middle">
          <Col xs={24} sm={12} md={6}>
            <Card
              style={cardStyle}
              onClick={() => setModalVisible({ ...modalVisible, kbzPay: true })}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Image
                src="/kpay.jpg"
                alt="KBZ Pay"
                width={60}
                height={60}
                style={{ marginBottom: '10px', width: '60px', height: '60px', objectFit: 'contain' }}
              />
              <Paragraph
                style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#1a1a1a', margin: 0, fontWeight: 500, transition: 'color 0.3s ease' }}
              >
                KBZ Pay
              </Paragraph>
            </Card>
            <Modal
              title="KBZ Pay Donation"
              open={modalVisible.kbzPay}
              onCancel={() => {
                setModalVisible({ ...modalVisible, kbzPay: false });
                storeUniqueKey('KBZ Pay');
              }}
              footer={null}
              centered
              width={300}
              style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', transition: 'background-color 0.3s ease' }}
              bodyStyle={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', color: isDarkMode ? '#ffffff' : '#1a1a1a', transition: 'background-color 0.3s ease, color 0.3s ease' }}
            >
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={qrImages.kbzPay}
                  alt="KBZ Pay QR Code"
                  width={200}
                  height={300}
                  style={{ margin: '0 auto' }}
                />
                <Paragraph
                  style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#1a1a1a', marginTop: '20px', padding: '20px', transition: 'color 0.3s ease' }}
                >
                  09765127445 <br />
                  Htet Yadanar Myo
                </Paragraph>
                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#1a1a1a', marginTop: '10px', transition: 'color 0.3s ease' }}>
                  Unique Key: <strong>{uniqueKey}</strong>
                  <Button
                    type="link"
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                    style={{ marginLeft: 8, color: isDarkMode ? '#40a9ff' : '#1890ff', transition: 'color 0.3s ease' }}
                  >
                    Copy
                  </Button>
                </Paragraph>
              </div>
            </Modal>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card
              style={cardStyle}
              onClick={() => setModalVisible({ ...modalVisible, AYAPay: true })}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Image
                src="/aya.png"
                alt="AYA Pay"
                width={60}
                height={60}
                style={{ marginBottom: '10px', width: '60px', height: '60px', objectFit: 'contain' }}
              />
              <Paragraph
                style={{ fontSize: '12px', color: isDarkMode ? '#ffffff' : '#1a1a1a', margin: 0, fontWeight: 500, transition: 'color 0.3s ease' }}
              >
                AYA Pay
              </Paragraph>
            </Card>
            <Modal
              title="AYA Pay Donation"
              open={modalVisible.AYAPay}
              onCancel={() => {
                setModalVisible({ ...modalVisible, AYAPay: false });
                storeUniqueKey('AYA Pay');
              }}
              footer={null}
              centered
              width={300}
              style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', transition: 'background-color 0.3s ease' }}
              bodyStyle={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff', color: isDarkMode ? '#ffffff' : '#1a1a1a', transition: 'background-color 0.3s ease, color 0.3s ease' }}
            >
              <div style={{ textAlign: 'center' }}>
                <Image
                  src={qrImages.AYAPay}
                  alt="AYA Pay QR Code"
                  width={200}
                  height={300}
                  style={{ margin: '0 auto' }}
                />
                <Paragraph
                  style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#1a1a1a', marginTop: '20px', padding: '20px', transition: 'color 0.3s ease' }}
                >
                  09765127445 <br />
                  Htet Yadanar Myo
                </Paragraph>
                <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#1a1a1a', marginTop: '10px', transition: 'color 0.3s ease' }}>
                  Paste Transaction Key in the notes: <strong>{uniqueKey}</strong>
                  <Button
                    type="link"
                    icon={<CopyOutlined />}
                    onClick={copyToClipboard}
                    style={{ marginLeft: 8, color: isDarkMode ? '#40a9ff' : '#1890ff', transition: 'color 0.3s ease' }}
                  >
                    Copy
                  </Button>
                </Paragraph>
              </div>
            </Modal>
          </Col>
        </Row>
      </section>

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
            backgroundColor: isDarkMode ? '#333333' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            border: isDarkMode ? '1px solid #ffffff' : '1px solid #000000',
            transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#444444' : '#e6f7ff';
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.backgroundColor = isDarkMode ? '#333333' : '#ffffff';
          }}
        >
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default DonatePage;