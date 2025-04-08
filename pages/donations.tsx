// app/admin/donations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout';
import { Table, Button, message, Space, Tag } from 'antd';
import { collection, query, limit, startAfter, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

interface Donation {
  id: string;
  name: string;
  amount: number;
  compositeKey: string;
}

const PAGE_SIZE = 10;

const DonationsPage: React.FC = () => {
  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchDonations = async (loadMore = false) => {
    try {
      setLoading(true);

      let q = query(collection(db, 'donations'), limit(PAGE_SIZE));
      if (loadMore && lastDoc) {
        q = query(collection(db, 'donations'), startAfter(lastDoc), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      const newDonations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));

      setData(prev => (loadMore ? [...prev, ...newDonations] : newDonations));
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching donations:', error);
      message.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleDelete = async (id: string, compositeKey: string) => {
    try {
      await deleteDoc(doc(db, 'donations', id));
      setData(prev => prev.filter(item => item.id !== id));
      message.success(`Deleted ${compositeKey}`);
    } catch (err) {
      console.error('Delete failed:', err);
      message.error('Failed to delete');
    }
  };

  const columns = [
    {
      title: 'Donor Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Amount (MMK)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => <Tag color="green">{amount.toLocaleString()} MMK</Tag>,
    },
    {
      title: 'Reference',
      dataIndex: 'compositeKey',
      key: 'compositeKey',
      render: (key: string | undefined) =>
        key ? (
          <small style={{ fontFamily: 'monospace', color: '#999' }}>{key.slice(0, 8)}...</small>
        ) : (
          <small style={{ fontFamily: 'monospace', color: '#999' }}>N/A</small>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Donation) => (
        <Button type="link" danger onClick={() => handleDelete(record.id, record.compositeKey)} loading={loading}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Donations ({data.length})</h1>
          <Button type="primary" onClick={() => fetchDonations()} loading={loading}>
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: true }}
        />

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button onClick={() => fetchDonations(true)} loading={loading} type="primary">
              Load More
            </Button>
          </div>
        )}
      </Space>
    </AdminLayout>
  );
};

export default DonationsPage;
