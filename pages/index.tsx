'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography, Row, Col } from 'antd';
import { DollarOutlined, EyeOutlined, BulbOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient'; // Adjust the import path to your Firebase config

const { Title, Paragraph } = Typography;

interface Donation {
  id: string;
  name: string;
  amount: number;
  compositeKey: string;
}

const Home: React.FC = () => {
  const [totalDonations, setTotalDonations] = useState<number>(0); // Sum of amounts from Firestore
  const [totalDonated, setTotalDonated] = useState<number>(75000); // Dummy data
  const [totalDonors, setTotalDonors] = useState<number>(0); // Count of fetched records
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchDonationStats = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'donations'));
        const donations: Donation[] = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().donorName || 'Unknown',
          amount: doc.data().amount || 0,
          compositeKey: doc.data().compositeKey || 'N/A',
        }));

        // Calculate total donations (sum of amounts)
        const sum = donations.reduce((acc, donation) => acc + donation.amount, 0);
        setTotalDonations(sum);

        // Set total donors (count of records)
        setTotalDonors(donations.length);

        console.log('Fetched donations:', donations);
        console.log('Total donations:', sum);
        console.log('Total donors:', donations.length);
      } catch (error) {
        console.error('Error fetching donation stats:', error);
      }
    };

    fetchDonationStats();
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
    position: 'relative' as const, // Type assertion for 'relative'
    transition: 'background-color 0.5s ease, color 0.5s ease', // Added transition
  };

  const cardStyle = {
    backgroundColor: isDarkMode ? '#1a1a1a' : '#f0f0f0',
    border: 'none',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    padding: '20px',
    textAlign: 'left' as const, // Type assertion for 'left'
    height: '100%',
    transition: 'background-color 0.5s ease, color 0.5s ease', // Added transition
  };

  const statCircleStyle = {
    backgroundColor: isDarkMode ? '#333333' : '#e0e0e0',
    borderRadius: '50%',
    width: '150px',
    height: '150px',
    display: 'flex',
    flexDirection: 'column' as const, // Type assertion for 'column'
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    margin: '10px auto',
    fontSize: '16px',
    color: isDarkMode ? '#ffffff' : '#000000',
    transition: 'background-color 0.5s ease, color 0.5s ease', // Added transition
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
          bottom: '20px',
          right: '20px',
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

      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '60px 20px 40px',
          marginBottom: '40px',
          borderBottom: isDarkMode ? '1px solid #333' : '1px solid #ddd',
          transition: 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease', // Added transition
        }}
      >
        <Title
          level={1}
          style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '36px', fontWeight: 600, marginBottom: '15px', transition: 'color 0.5s ease' }} // Added transition
        >
          Myanmar Earthquake Relief Fund
        </Title>
        <Paragraph
          style={{
            fontSize: '16px',
            maxWidth: '600px',
            margin: '0 auto 30px',
            color: isDarkMode ? '#ffffff' : '#000000',
            lineHeight: '1.6',
            transition: 'color 0.5s ease', // Added transition
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
              backgroundColor: isDarkMode ? '#000000' : '#ffffff',
              borderColor: isDarkMode ? '#000000' : '#000000',
              color: isDarkMode ? '#ffffff' : '#000000',
              transition: 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease', // Added transition
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
              backgroundColor: isDarkMode ? '#000000' : '#ffffff',
              transition: 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease', // Added transition
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
              <Title
                level={3}
                style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '28px', marginBottom: '15px', fontWeight: 500, transition: 'color 0.5s ease' }} // Added transition
              >
                About the Earthquake
              </Title>
              <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666', lineHeight: '1.6', transition: 'color 0.5s ease' }} // Added transition
              >
                On March 28, 2025, a 7.7-magnitude earthquake hit Myanmar near Mandalay, followed by a 6.4-magnitude
                aftershock. It claimed over 3,000 lives, demolished infrastructure, and displaced thousands, worsening the
                crisis.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card style={cardStyle}>
              <Title
                level={3}
                style={{ color: isDarkMode ? '#ffffff' : '#000000', fontSize: '28px', marginBottom: '15px', fontWeight: 500, transition: 'color 0.5s ease' }} // Added transition
              >
                Our Relief Efforts
              </Title>
              <Paragraph style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666', lineHeight: '1.6', transition: 'color 0.5s ease' }} // Added transition
              >
                DevAid’s team delivers food, medical camps, and shelters, collaborating with local NGOs and aiding mental
                health and education for affected children.
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
              <Typography.Text style={{ fontSize: '16px', color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.5s ease' }} // Added transition
              >
                Total Donations
              </Typography.Text>
              <Typography.Text style={{ fontSize: '24px', fontWeight: 600 }}>
                {totalDonations.toLocaleString()}
              </Typography.Text>
              <Typography.Text style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.5s ease' }} // Added transition
              >
                MMK
              </Typography.Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={statCircleStyle}>
              <Typography.Text style={{ fontSize: '16px', color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.5s ease' }} // Added transition
              >
                Total Donated
              </Typography.Text>
              <Typography.Text style={{ fontSize: '24px', fontWeight: 600 }}>
                {totalDonated.toLocaleString()}
              </Typography.Text>
              <Typography.Text style={{ fontSize: '14px', color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.5s ease' }} // Added transition
              >
                MMK
              </Typography.Text>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={statCircleStyle}>
              <Typography.Text style={{ fontSize: '16px', color: isDarkMode ? '#cccccc' : '#666666', transition: 'color 0.5s ease' }} // Added transition
              >
                Total Donors
              </Typography.Text>
              <Typography.Text style={{ fontSize: '24px', fontWeight: 600 }}>
                {totalDonors.toLocaleString()}
              </Typography.Text>
            </div>
          </Col>
        </Row>
      </section>

      {/* Call to Action */}
      <section
        style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: isDarkMode ? '#000000' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          borderRadius: '10px',
          transition: 'background-color 0.5s ease, color 0.5s ease', // Added transition
        }}
      >
        <Title
          level={2}
          style={{ color: isDarkMode ? '#ffffff' : '#000000', marginBottom: '15px', fontSize: '32px', fontWeight: 600, transition: 'color 0.5s ease' }} // Added transition
        >
          Support the Recovery
        </Title>
        <Paragraph
          style={{
            fontSize: '16px',
            maxWidth: '600px',
            margin: '0 auto 30px',
            color: isDarkMode ? '#ffffff' : '#000000',
            lineHeight: '1.6',
            transition: 'color 0.5s ease', // Added transition
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
              backgroundColor: isDarkMode ? '#000000' : '#ffffff',
              borderColor: isDarkMode ? '#000000' : '#000000',
              color: isDarkMode ? '#ffffff' : '#000000',
              transition: 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease', // Added transition
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
              backgroundColor: isDarkMode ? '#000000' : '#ffffff',
              transition: 'background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease', // Added transition
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