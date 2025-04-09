// app/admin/donations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout';
import {
  Table, Button, message, Space, Tag, Input, Modal, Form, InputNumber, Dropdown, Menu
} from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  collection, query, limit, startAfter, getDocs,
  doc, deleteDoc, addDoc, updateDoc, getDocsFromServer
} from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { v4 as uuidv4 } from 'uuid';

interface Donation {
  id: string;
  name: string;
  amount: number;
  compositeKey: string;
}

const PAGE_SIZE = 10;

const DonationsPage: React.FC = () => {
  const [data, setData] = useState<Donation[]>([]);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [form] = Form.useForm();

  const fetchAllDonations = async () => {
    const snapshot = await getDocsFromServer(collection(db, 'donations'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
  };

  const fetchDonations = async (loadMore = false) => {
    try {
      setLoading(true);
      let q = query(collection(db, 'donations'), limit(PAGE_SIZE));
      if (loadMore && lastDoc) {
        q = query(collection(db, 'donations'), startAfter(lastDoc), limit(PAGE_SIZE));
      }
      const snapshot = await getDocs(q);
      const newDonations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donation));
      const updatedData = loadMore ? [...data, ...newDonations] : newDonations;
      setData(updatedData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      if (!loadMore) {
        const all = await fetchAllDonations();
        setAllDonations(all);
      }
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

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = allDonations.filter(d =>
      d.name.toLowerCase().includes(value.toLowerCase()) ||
      d.compositeKey?.toLowerCase().includes(value.toLowerCase())
    );
    setData(filtered);
    setHasMore(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'donations', id));
      setData(prev => prev.filter(item => item.id !== id));
      setAllDonations(prev => prev.filter(item => item.id !== id));
      message.success('Donation deleted');
    } catch (err) {
      console.error('Delete failed:', err);
      message.error('Failed to delete');
    }
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    form.setFieldsValue(donation);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: { name: string; amount: number }) => {
    if (!editingDonation) return;
    try {
      const ref = doc(db, 'donations', editingDonation.id);
      await updateDoc(ref, values);
      const updated: Donation = { ...editingDonation, ...values };
      setData(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      setAllDonations(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      message.success('Donation updated');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error('Failed to update donation');
    }
  };

  const generateCertificate = async (name: string, amount: number) => {
    try {
      const templateBytes = await fetch('/certi.pdf').then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(templateBytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.getPage(0);
      page.drawText(name, { x: 130, y: 275, size: 16, font, color: rgb(0, 0, 0) });
      page.drawText(`MMK ${amount.toLocaleString()}`, { x: 250, y: 355, size: 20, font, color: rgb(0, 0, 0) });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${name}_certificate.pdf`;
      link.click();
    } catch (error) {
      console.error('Certificate error:', error);
    }
  };

  const handleAddDonation = async (values: { name: string; amount: number }) => {
    const newDonation = {
      name: values.name,
      amount: values.amount,
      compositeKey: uuidv4(),
    };
    try {
      const docRef = await addDoc(collection(db, 'donations'), newDonation);
      const added: Donation = { id: docRef.id, ...newDonation };
      setData(prev => [added, ...prev]);
      setAllDonations(prev => [added, ...prev]);
      message.success('Donation added');
      form.resetFields();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      message.error('Failed to add donation');
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
        key ? <small style={{ fontFamily: 'monospace', color: '#999' }}>{key.slice(0, 8)}...</small> : <small style={{ fontFamily: 'monospace', color: '#999' }}>N/A</small>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Donation) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item onClick={() => handleEdit(record)}>Edit</Menu.Item>
              <Menu.Item onClick={() => handleDelete(record.id)}>Delete</Menu.Item>
              <Menu.Item onClick={() => generateCertificate(record.name, record.amount)}>Generate Certificate</Menu.Item>
            </Menu>
          }
        >
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold' }}>Donors ({data.length})</h1>
          <Space>
            <Input.Search
              placeholder="Search by name or reference"
              allowClear
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 300 }}
            />
            <Button onClick={() => fetchDonations()} loading={loading}>Refresh</Button>
            <Button type="primary" onClick={() => setIsAddModalOpen(true)}>Add Donation</Button>
          </Space>
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

        <Modal
          title="Add Donation"
          open={isAddModalOpen}
          onCancel={() => setIsAddModalOpen(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddDonation}
            autoComplete="off" // Prevent browser autofill issues
          >
            <Form.Item
              name="name"
              label="Donor Name"
              rules={[{ required: true, message: "Please enter the donor name" }]}
            >
              <Input placeholder="Enter donor name" />
            </Form.Item>
            <Form.Item
              name="amount"
              label="Amount (MMK)"
              rules={[
                { required: true, message: "Please enter the donation amount" },
                { type: "number", min: 1, message: "Amount must be greater than 0" },
              ]}
            >
              <InputNumber style={{ width: "100%" }} min={1} placeholder="Enter donation amount" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Add
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Edit Donation"
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
            <Form.Item name="name" label="Donor Name" rules={[{ required: true }]}> <Input /> </Form.Item>
            <Form.Item name="amount" label="Amount (MMK)" rules={[{ required: true }]}> <InputNumber style={{ width: '100%' }} min={1} /> </Form.Item>
            <Form.Item> <Button type="primary" htmlType="submit" block>Update</Button> </Form.Item>
          </Form>
        </Modal>

      </Space>
    </AdminLayout>
  );
};

export default DonationsPage;