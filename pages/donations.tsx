// app/admin/donations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout';
import { Table, Button, message, Space, Tag} from 'antd';
import { collection, query, limit, startAfter, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import {Input} from 'antd';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

interface Donation {
  id: string;
  name: string;
  amount: number;
  compositeKey: string;
}

const PAGE_SIZE = 10;

/**
 * Page to manage donations
 *
 * This page displays a table of donations and provides buttons to delete a donation
 * and generate a certificate for a donation. It also provides a search bar to
 * filter the donations by donor name.
 *
 * The page uses the `useEffect` hook to fetch the donations from the Firebase
 * Firestore database when the component mounts. It also uses the `useState` hook
 * to store the donations in the component's state.
 *
 * The page uses the `Table` component from Ant Design to display the donations.
 * The `Table` component is configured to use the `columns` prop to specify the
 * columns of the table, and the `dataSource` prop to specify the data for the
 * table. The `loading` prop is also used to display a loading indicator when the
 * data is being fetched.
 *
 * The page also uses the `Pagination` component from Ant Design to provide
 * pagination for the table. The `Pagination` component is configured to use the
 * `current` prop to specify the current page, the `pageSize` prop to specify the
 * number of items per page, and the `total` prop to specify the total number of
 * items. The `onChange` prop is also used to specify a function to call when the
 * page is changed.
 *
 * @returns {React.ReactElement} The page content
 */
const DonationsPage: React.FC = () => {
  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleSearch = (value: string) => {
    setSearchText(value.toLowerCase());
  };
  const fetchDonations = async (page = 1) => {
    try {
      setLoading(true);
  
      const offset = (page - 1) * PAGE_SIZE; // Calculate the offset for pagination
      let q = query(collection(db, 'donations'), limit(PAGE_SIZE));
  
      if (offset > 0) {
        const snapshot = await getDocs(query(collection(db, 'donations'), limit(offset)));
        const lastVisible = snapshot.docs[snapshot.docs.length - 1];
        q = query(collection(db, 'donations'), startAfter(lastVisible), limit(PAGE_SIZE));
      }
  
      const snapshot = await getDocs(q);
      const newDonations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
  
      setData(newDonations);
      setCurrentPage(page); // Update the current page
    } catch (error) {
      console.error('Error fetching donations:', error);
      message.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTotalDonations = async () => {
      const snapshot = await getDocs(collection(db, 'donations'));
      setTotal(snapshot.size); // Set the total number of donations
    };
    fetchTotalDonations();
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

  const handlePageChange = (page: number) => {
    fetchDonations(page); // Fetch data for the selected page
  };

  const generateCertificate = async (name: string, amount: number) => {
    try {
      // Load PDF
      const templateBytes = await fetch("/certi.pdf").then((res) =>
        res.arrayBuffer()
      );
  
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(templateBytes);
  
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
      // Get the first page of the document
      const page = pdfDoc.getPage(0);
  
      // Add the donor's name
      page.drawText(name, {
        x: 130,
        y: 275,
        size: 16,
        font,
        color: rgb(0, 0, 0), 
      });
  
      // Add the donation amount
      page.drawText(`MMK ${amount.toLocaleString()}`, {
        x: 250,
        y: 355, 
        size: 20,
        font,
        color: rgb(0, 0, 0),
      });
  
      // Serialize the PDF to bytes
      const pdfBytes = await pdfDoc.save();
  
      // Trigger download (for client-side)
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${name}_certificate.pdf`;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  const columns = [
    {
      title: 'Donor Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Donation, b: Donation) => a.name.localeCompare(b.name), // Sort alphabetically
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Amount (MMK)',
      dataIndex: 'amount',
      key: 'amount',
      sorter: (a: Donation, b: Donation) => a.amount - b.amount, // Sort numerically
      render: (amount: number) => <Tag color="green">{amount.toLocaleString()} MMK</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Donation) => (
        <Space>
          <Button type="link" danger onClick={() => handleDelete(record.id, record.compositeKey)} loading={loading}>
            Delete
          </Button>
          <Button type="link" onClick={() => generateCertificate(record.name, record.amount)} loading={loading}>
            Generate Certificate
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Input.Search
            placeholder="Search by donor name"
            onSearch={handleSearch}
            style={{ width: 300, marginBottom: 16 }}
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Donations ({data.length})</h1>
          <Button type="primary" onClick={() => fetchDonations()} loading={loading}>
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={data.filter(donation => donation.name.toLowerCase().includes(searchText))}
          rowKey="id"
          loading={loading}
          pagination={
            {
              current: currentPage,
              pageSize: PAGE_SIZE,
              total: total,
              onChange: handlePageChange,
              showSizeChanger: false,
            }
          }
          scroll={{ x: true }}
        />
      </Space>

    </AdminLayout>
  );
};

export default DonationsPage;
