'use client';

import React, { useState } from 'react';
import { Button, Table, Typography } from 'antd';
import Link from 'next/link'; // Import Link from Next.js
const { Title, Text, Paragraph } = Typography;

interface Donation {
    key: string;
    donorName: string;
    amount: string;
    date: string;
}

const Donations: React.FC = () => {
    const [donationsData] = useState<Donation[]>([
        { key: '1', donorName: 'Bob Brown', amount: '$75.00', date: '5 Mar, 2024' },
        { key: '2', donorName: 'Alice Johnson', amount: '$25.00', date: '20 Feb, 2024' },
        { key: '3', donorName: 'Jane Smith', amount: '$100.00', date: '15 Jan, 2024' },
        { key: '4', donorName: 'John Doe', amount: '$50.00', date: '10 Dec, 2023' },
    ]);
    const [isDarkMode, setIsDarkMode] = useState(false); // New state for theme

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const columns = [
        {
            title: 'Donor Name',
            dataIndex: 'donorName',
            key: 'donorName',
            onCell: () => ({
                style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#000000' : '#ffffff' },
            }),
            onHeaderCell: () => ({
                style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#333333' : '#f0f0f0' },
            }),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            onCell: () => ({
                style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#000000' : '#ffffff' },
            }),
            onHeaderCell: () => ({
                style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#333333' : '#f0f0f0' },
            }),
        },
        {
            title: 'Date of Transaction',
            dataIndex: 'date',
            key: 'date',
            onCell: () => ({
                style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#000000' : '#ffffff' },
            }),
            onHeaderCell: () => ({
                style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#333333' : '#f0f0f0' },
            }),
        },
    ];

    return (
        <div style={{
            backgroundColor: isDarkMode ? '#000000' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
            minHeight: '100vh',
            padding: '20px',
            fontFamily: 'var(--font-jetbrains-mono)',
            transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
            {/* Dev Aid Title at top left */}
            <Title level={2} style={{
                color: isDarkMode ? '#ffffff' : '#000000',
                fontSize: '24px',
                fontWeight: 600,
                position: 'absolute',
                top: '20px',
                left: '20px',
                margin: 0,
                transition: 'color 0.3s ease'
            }}>
                Dev Aid
            </Title>

            {/* Theme Toggle Button - Light bulb at bottom right */}
            <Button
                onClick={toggleTheme}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000,
                    backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                    color: isDarkMode ? '#000000' : '#ffffff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                }}
            >
                💡
            </Button>

            {/* Header */}
            <Title level={1} style={{
                color: isDarkMode ? '#ffffff' : '#000000',
                fontSize: '36px',
                fontWeight: 600,
                marginBottom: '15px',
                textAlign: 'center',
                transition: 'color 0.3s ease'
            }}>
                Donations
            </Title>
            <Paragraph style={{
                fontSize: '16px',
                color: isDarkMode ? '#ffffff' : '#000000',
                textAlign: 'center',
                marginBottom: '30px',
                transition: 'color 0.3s ease'
            }}>
                Thank you for your generous support!
            </Paragraph>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={donationsData}
                pagination={{ pageSize: 5 }}
                style={{
                    backgroundColor: isDarkMode ? '#000000' : '#ffffff',
                    color: isDarkMode ? '#ffffff' : '#000000',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                }}
                onRow={(record, rowIndex) => {
                    return {
                        onMouseEnter: (event) => {
                            const row = event.currentTarget;
                            row.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#f0f0f0'; // Hover color adjusted for theme
                        },
                        onMouseLeave: (event) => {
                            const row = event.currentTarget;
                            row.style.backgroundColor = isDarkMode ? '#000000' : '#ffffff'; // Reset to base background
                        },
                    };
                }}
            />

            {/* Footer */}
            <div style={{
                textAlign: 'center',
                marginTop: '40px',
                color: isDarkMode ? '#cccccc' : '#666666',
                fontSize: '12px',
                transition: 'color 0.3s ease'
            }}>
                © 2024 Donation Website. All rights reserved.
            </div>

            {/* Back to Home Button with Link */}
            <Link href="/">
                <Button
                    style={{
                        display: 'block',
                        margin: '20px auto 60px auto', // Centered with bottom margin to avoid overlap with light bulb
                        backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                        color: isDarkMode ? '#000000' : '#ffffff',
                        transition: 'background-color 0.3s ease, color 0.3s ease'
                    }}
                >
                    Back to Home
                </Button>
            </Link>
        </div>
    );
};

export default Donations;