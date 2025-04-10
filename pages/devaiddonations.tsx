// app/admin/donations/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/layout';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input as ChakraInput,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  Badge,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
  Center,
  Heading,
} from '@chakra-ui/react';
import { FaGripVertical } from 'react-icons/fa';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  collection,
  query,
  limit,
  startAfter,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
  updateDoc,
  getDocsFromServer,
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
  const [formData, setFormData] = useState({ name: '', amount: '' });
  const toast = useToast();

  const fetchAllDonations = async () => {
    const snapshot = await getDocsFromServer(collection(db, 'donations'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
  };

  const fetchDonations = React.useCallback(
    async (loadMore = false) => {
      try {
        setLoading(true);
        let q = query(collection(db, 'donations'), limit(PAGE_SIZE));
        if (loadMore && lastDoc) {
          q = query(collection(db, 'donations'), startAfter(lastDoc), limit(PAGE_SIZE));
        }
        const snapshot = await getDocs(q);
        const newDonations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
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
        toast({
          title: 'Error',
          description: 'Failed to load donations',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [data, lastDoc, toast]
  );

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    const filtered = allDonations.filter(
      (d) =>
        d.name.toLowerCase().includes(value.toLowerCase()) ||
        d.compositeKey?.toLowerCase().includes(value.toLowerCase())
    );
    setData(filtered);
    setHasMore(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'donations', id));
      setData((prev) => prev.filter((item) => item.id !== id));
      setAllDonations((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: 'Success',
        description: 'Donation deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Delete failed:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation);
    setFormData({ name: donation.name, amount: donation.amount.toString() });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingDonation) return;
    try {
      const ref = doc(db, 'donations', editingDonation.id);
      const updatedValues = {
        name: formData.name,
        amount: parseFloat(formData.amount),
      };
      await updateDoc(ref, updatedValues);
      const updated: Donation = { ...editingDonation, ...updatedValues };
      setData((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setAllDonations((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      toast({
        title: 'Success',
        description: 'Donation updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to update donation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const generateCertificate = async (name: string, amount: number) => {
    try {
      const templateBytes = await fetch('/certi.pdf').then((res) => res.arrayBuffer());
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
      toast({
        title: 'Success',
        description: 'Certificate generated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Certificate error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate certificate',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAddDonation = async () => {
    const newDonation = {
      name: formData.name,
      amount: parseFloat(formData.amount),
      compositeKey: uuidv4(),
    };
    try {
      const docRef = await addDoc(collection(db, 'donations'), newDonation);
      const added: Donation = { id: docRef.id, ...newDonation };
      setData((prev) => [added, ...prev]);
      setAllDonations((prev) => [added, ...prev]);
      toast({
        title: 'Success',
        description: 'Donation added',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setFormData({ name: '', amount: '' });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'Failed to add donation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }) => {
    const { name, value } = 'target' in e ? e.target : e;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AdminLayout>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" wrap="wrap" spacing={3}>
          <Heading as="h1" size="lg" fontWeight="bold">
            Donors ({data.length})
          </Heading>
          <HStack spacing={3}>
            <Input
              placeholder="Search by name or reference"
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              w={{ base: 'full', md: '300px' }}
            />
            <Button onClick={() => fetchDonations()} isLoading={loading} colorScheme="blue">
              Refresh
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} colorScheme="teal">
              Add Donation
            </Button>
          </HStack>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Donor Name</Th>
                <Th>Amount (MMK)</Th>
                <Th>Reference</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((record) => (
                <Tr key={record.id}>
                  <Td>
                    <Text fontWeight="bold">{record.name}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="green">{record.amount.toLocaleString()} MMK</Badge>
                  </Td>
                  <Td>
                    <Text fontFamily="monospace" color="gray.500" fontSize="sm">
                      {record.compositeKey ? `${record.compositeKey.slice(0, 8)}...` : 'N/A'}
                    </Text>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<FaGripVertical />} variant="ghost" />
                      <MenuList>
                        <MenuItem onClick={() => handleEdit(record)}>Edit</MenuItem>
                        <MenuItem onClick={() => handleDelete(record.id)}>Delete</MenuItem>
                        <MenuItem onClick={() => generateCertificate(record.name, record.amount)}>
                          Generate Certificate
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {hasMore && (
          <Center mt={4}>
            <Button onClick={() => fetchDonations(true)} isLoading={loading} colorScheme="blue">
              Load More
            </Button>
          </Center>
        )}

        {/* Add Donation Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Donation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Donor Name</FormLabel>
                  <ChakraInput
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter donor name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Amount (MMK)</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="amount"
                      value={formData.amount}
                      onChange={(e) => handleFormChange({ target: { name: 'amount', value: e.target.value } })}
                      placeholder="Enter donation amount"
                    />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={handleAddDonation} mr={3}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Donation Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Donation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Donor Name</FormLabel>
                  <ChakraInput
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Enter donor name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Amount (MMK)</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="amount"
                      value={formData.amount}
                      onChange={(e) => handleFormChange({ target: { name: 'amount', value: e.target.value } })}
                      placeholder="Enter donation amount"
                    />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleEditSubmit} mr={3}>
                Update
              </Button>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </AdminLayout>
  );
};

export default DonationsPage;