'use client';

import React, { useState, useEffect } from 'react';
import { Button, Table, Typography, Input } from 'antd';
import Link from 'next/link';
import { collection, query, limit, startAfter, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient'; // Adjust the import path to your Firebase config
import { ArrowLeftOutlined, BulbOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Search } = Input;

interface Donation {
  id: string;
  name: string;
  amount: number;
  compositeKey: string;
}

const PAGE_SIZE = 10;

const Donations: React.FC = () => {
  const [donationsData, setDonationsData] = useState<Donation[]>([]);
  const [filteredData, setFilteredData] = useState<Donation[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Fetch donations from Firestore with optional search filtering
  const fetchDonations = async (loadMore = false) => {
    try {
      setLoading(true);
      let q;

      if (searchQuery.trim()) {
        // Server-side search by name
        q = query(
          collection(db, 'donations'),
          where('name', '>=', searchQuery.trim()),
          where('name', '<=', searchQuery.trim() + '\uf8ff'), // Range for prefix search
          orderBy('name'), // Order by name for search consistency
          limit(PAGE_SIZE)
        );
        if (loadMore && lastDoc) {
          q = query(
            collection(db, 'donations'),
            where('name', '>=', searchQuery.trim()),
            where('name', '<=', searchQuery.trim() + '\uf8ff'),
            orderBy('name'),
            startAfter(lastDoc),
            limit(PAGE_SIZE)
          );
        }
      } else {
        // Fetch all donations when no search query
        q = query(collection(db, 'donations'), orderBy('amount'), limit(PAGE_SIZE));
        if (loadMore && lastDoc) {
          q = query(collection(db, 'donations'), orderBy('amount'), startAfter(lastDoc), limit(PAGE_SIZE));
        }
      }

      const snapshot = await getDocs(q);
      const fetchedDonations = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Raw Firestore doc:', { id: doc.id, ...data });
        return {
          id: doc.id,
          name: data.name || data.donorName || 'Unknown', // Fallback for field name
          amount: data.amount || 0,
          compositeKey: data.compositeKey || 'N/A',
        };
      });

      console.log('Fetched documents:', snapshot.docs.length);
      console.log('Fetched donations:', fetchedDonations);

      setDonationsData(prev => {
        const newData = loadMore ? [...prev, ...fetchedDonations] : fetchedDonations;
        setFilteredData(newData); // No additional client-side filtering needed
        return newData;
      });
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length > 0);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchDonations();
  }, []);

  // Handle search input and refetch data
  const handleSearch = (value: string) => {
    const trimmedValue = value.trim();
    setSearchQuery(trimmedValue);
    setLastDoc(null); // Reset pagination for new search
    setDonationsData([]); // Clear existing data
    setFilteredData([]);
    fetchDonations(); // Refetch with the new search query
  };

  const columns = [
    {
      title: 'Donor Name',
      dataIndex: 'name',
      key: 'name',
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
      render: (amount: number) => `${amount.toLocaleString()} MMK`,
      onCell: () => ({
        style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#000000' : '#ffffff' },
      }),
      onHeaderCell: () => ({
        style: { color: isDarkMode ? '#ffffff' : '#000000', backgroundColor: isDarkMode ? '#333333' : '#f0f0f0' },
      }),
    },
  ];

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? '#000000' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'var(--font-jetbrains-mono)',
        transition: 'background-color 0.3s ease, color 0.3s ease',
      }}
    >
      {/* Dev Aid Title */}
      <Title
        level={2}
        style={{
          color: isDarkMode ? '#ffffff' : '#000000',
          fontSize: '24px',
          fontWeight: 600,
          position: 'absolute',
          top: '20px',
          left: '20px',
          margin: 0,
          transition: 'color 0.3s ease',
        }}
      >
        Dev Aid
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
      {/* Header */}
      <Title
        level={1}
        style={{
          color: isDarkMode ? '#ffffff' : '#000000',
          fontSize: '36px',
          fontWeight: 600,
          marginBottom: '15px',
          textAlign: 'center',
          transition: 'color 0.3s ease',
        }}
      >
        Donations
      </Title>
      <Paragraph
        style={{
          fontSize: '16px',
          color: isDarkMode ? '#ffffff' : '#000000',
          textAlign: 'center',
          marginBottom: '20px',
          transition: 'color 0.3s ease',
        }}
      >
        Thank you for your generous support!
      </Paragraph>

      {/* Search Bar */}
      <Search
        placeholder="Search by donor name"
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 300, marginBottom: 20, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        enterButton
      />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={false}
        loading={loading}
        style={{
          backgroundColor: isDarkMode ? '#000000' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        }}
        onRow={(record, rowIndex) => ({
          onMouseEnter: (event) => {
            const row = event.currentTarget;
            row.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#f0f0f0';
          },
          onMouseLeave: (event) => {
            const row = event.currentTarget;
            row.style.backgroundColor = isDarkMode ? '#000000' : '#ffffff';
          },
        })}
      />

      {/* Load More Button */}
      {hasMore && (
        <Button
          onClick={() => fetchDonations(true)}
          loading={loading}
          style={{ display: 'block', margin: '20px auto' }}
        >
          Load More
        </Button>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '40px',
          color: isDarkMode ? '#cccccc' : '#666666',
          fontSize: '12px',
          transition: 'color 0.3s ease',
        }}
      >

      </div>

      {/* Back to Home Button */}
      <Link href="/">
        <Button
          style={{
            display: 'block',
            margin: '20px auto 60px auto',
            backgroundColor: isDarkMode ? '#ffffff' : '#000000',
            color: isDarkMode ? '#000000' : '#ffffff',
            transition: 'background-color 0.3s ease, color 0.3s ease',
          }}
        >
          Back to Home
        </Button>
      </Link>
    </div>
  );
};

export default Donations;