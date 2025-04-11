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

interface DonatedBack {
  id: string;
  organizationName: string;
  count: number;
  items: string;
  typeOfItems: string;
  total: number;
}

const PAGE_SIZE = 10;

const DonationsPage: React.FC = () => {
  const [donationsData, setDonationsData] = useState<Donation[]>([]);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [donatedBackData, setDonatedBackData] = useState<DonatedBack[]>([]);
  const [allDonatedBack, setAllDonatedBack] = useState<DonatedBack[]>([]);
  const [loading, setLoading] = useState(false);
  const [donatedBackLoading, setDonatedBackLoading] = useState(false);
  const [donationsPage, setDonationsPage] = useState(1);
  const [donatedBackPage, setDonatedBackPage] = useState(1);
  const [donationsTotalPages, setDonationsTotalPages] = useState(1);
  const [donatedBackTotalPages, setDonatedBackTotalPages] = useState(1);
  const [donationsSearchText, setDonationsSearchText] = useState('');
  const [donatedBackSearchText, setDonatedBackSearchText] = useState('');
  const [isAddDonationModalOpen, setIsAddDonationModalOpen] = useState(false);
  const [isEditDonationModalOpen, setIsEditDonationModalOpen] = useState(false);
  const [isAddDonatedBackModalOpen, setIsAddDonatedBackModalOpen] = useState(false);
  const [isEditDonatedBackModalOpen, setIsEditDonatedBackModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
  const [editingDonatedBack, setEditingDonatedBack] = useState<DonatedBack | null>(null);
  const [donationFormData, setDonationFormData] = useState({ name: '', amount: '' });
  const [donatedBackFormData, setDonatedBackFormData] = useState({
    organizationName: '',
    count: '',
    items: '',
    typeOfItems: '',
    total: '',
  });
  const toast = useToast();

  // Fetch all donations
  const fetchAllDonations = async () => {
    const snapshot = await getDocsFromServer(collection(db, 'donations'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
  };

  // Fetch donations with pagination
  const fetchDonations = React.useCallback(
    async (page: number, search: string = '') => {
      try {
        setLoading(true);
        const all = await fetchAllDonations();
        setAllDonations(all);

        let filtered = all;
        if (search) {
          filtered = all.filter(
            (d) =>
              d.name.toLowerCase().includes(search.toLowerCase()) ||
              d.compositeKey?.toLowerCase().includes(search.toLowerCase())
          );
        }

        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        setDonationsTotalPages(totalPages);

        const startIndex = (page - 1) * PAGE_SIZE;
        const paginatedData = filtered.slice(startIndex, startIndex + PAGE_SIZE);
        setDonationsData(paginatedData);
      } catch (error) {
        console.error('Error fetching donations:', error);
        toast({ title: 'Error', description: 'Failed to load donations', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Fetch all donated back entries
  const fetchAllDonatedBack = async () => {
    const snapshot = await getDocsFromServer(collection(db, 'donationDetails'));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      organizationName: doc.data().organizationName || 'Unknown',
      count: doc.data().count || 0,
      items: doc.data().items || 'N/A',
      typeOfItems: doc.data().typeOfItems || 'N/A',
      total: doc.data().total || 0,
    } as DonatedBack));
  };

  // Fetch donated back with pagination
  const fetchDonatedBack = React.useCallback(
    async (page: number, search: string = '') => {
      try {
        setDonatedBackLoading(true);
        const all = await fetchAllDonatedBack();
        setAllDonatedBack(all);

        let filtered = all;
        if (search) {
          filtered = all.filter(
            (d) =>
              d.organizationName.toLowerCase().includes(search.toLowerCase()) ||
              d.items.toLowerCase().includes(search.toLowerCase())
          );
        }

        const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
        setDonatedBackTotalPages(totalPages);

        const startIndex = (page - 1) * PAGE_SIZE;
        const paginatedData = filtered.slice(startIndex, startIndex + PAGE_SIZE);
        setDonatedBackData(paginatedData);
      } catch (error) {
        console.error('Error fetching donated back:', error);
        toast({ title: 'Error', description: 'Failed to load donated back', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setDonatedBackLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchDonations(donationsPage, donationsSearchText);
    fetchDonatedBack(donatedBackPage, donatedBackSearchText);
  }, [donationsPage, donatedBackPage, donationsSearchText, donatedBackSearchText, fetchDonations, fetchDonatedBack]);

  const handleDonationsSearch = (value: string) => {
    setDonationsSearchText(value);
    setDonationsPage(1); // Reset to page 1 on search
    fetchDonations(1, value);
  };

  const handleDonatedBackSearch = (value: string) => {
    setDonatedBackSearchText(value);
    setDonatedBackPage(1); // Reset to page 1 on search
    fetchDonatedBack(1, value);
  };

  const handleDeleteDonation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'donations', id));
      setDonationsData((prev) => prev.filter((item) => item.id !== id));
      setAllDonations((prev) => prev.filter((item) => item.id !== id));
      fetchDonations(donationsPage, donationsSearchText); // Refresh pagination
      toast({ title: 'Success', description: 'Donation deleted', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Delete failed:', err);
      toast({ title: 'Error', description: 'Failed to delete', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleDeleteDonatedBack = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'donationDetails', id));
      setDonatedBackData((prev) => prev.filter((item) => item.id !== id));
      setAllDonatedBack((prev) => prev.filter((item) => item.id !== id));
      fetchDonatedBack(donatedBackPage, donatedBackSearchText); // Refresh pagination
      toast({ title: 'Success', description: 'Donated back entry deleted', status: 'success', duration: 3000, isClosable: true });
    } catch (err) {
      console.error('Delete failed:', err);
      toast({ title: 'Error', description: 'Failed to delete', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEditDonation = (donation: Donation) => {
    setEditingDonation(donation);
    setDonationFormData({ name: donation.name, amount: donation.amount.toString() });
    setIsEditDonationModalOpen(true);
  };

  const handleEditDonatedBack = (donatedBack: DonatedBack) => {
    setEditingDonatedBack(donatedBack);
    setDonatedBackFormData({
      organizationName: donatedBack.organizationName,
      count: donatedBack.count.toString(),
      items: donatedBack.items,
      typeOfItems: donatedBack.typeOfItems,
      total: donatedBack.total.toString(),
    });
    setIsEditDonatedBackModalOpen(true);
  };

  const handleEditDonationSubmit = async () => {
    if (!editingDonation) return;
    try {
      const ref = doc(db, 'donations', editingDonation.id);
      const updatedValues = {
        name: donationFormData.name,
        amount: parseFloat(donationFormData.amount),
      };
      await updateDoc(ref, updatedValues);
      fetchDonations(donationsPage, donationsSearchText); // Refresh pagination
      toast({ title: 'Success', description: 'Donation updated', status: 'success', duration: 3000, isClosable: true });
      setIsEditDonationModalOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to update donation', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleEditDonatedBackSubmit = async () => {
    if (!editingDonatedBack) return;
    try {
      const ref = doc(db, 'donationDetails', editingDonatedBack.id);
      const updatedValues = {
        organizationName: donatedBackFormData.organizationName,
        count: parseFloat(donatedBackFormData.count),
        items: donatedBackFormData.items,
        typeOfItems: donatedBackFormData.typeOfItems,
        total: parseFloat(donatedBackFormData.total),
      };
      await updateDoc(ref, updatedValues);
      fetchDonatedBack(donatedBackPage, donatedBackSearchText); // Refresh pagination
      toast({ title: 'Success', description: 'Donated back updated', status: 'success', duration: 3000, isClosable: true });
      setIsEditDonatedBackModalOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to update donated back', status: 'error', duration: 3000, isClosable: true });
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
      toast({ title: 'Success', description: 'Certificate generated', status: 'success', duration: 3000, isClosable: true });
    } catch (error) {
      console.error('Certificate error:', error);
      toast({ title: 'Error', description: 'Failed to generate certificate', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleAddDonation = async () => {
    const newDonation = {
      name: donationFormData.name,
      amount: parseFloat(donationFormData.amount),
      compositeKey: uuidv4(),
    };
    try {
      const docRef = await addDoc(collection(db, 'donations'), newDonation);
      fetchDonations(donationsPage, donationsSearchText); // Refresh pagination
      toast({ title: 'Success', description: 'Donation added', status: 'success', duration: 3000, isClosable: true });
      setDonationFormData({ name: '', amount: '' });
      setIsAddDonationModalOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to add donation', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleAddDonatedBack = async () => {
    const newDonatedBack = {
      organizationName: donatedBackFormData.organizationName,
      count: parseFloat(donatedBackFormData.count),
      items: donatedBackFormData.items,
      typeOfItems: donatedBackFormData.typeOfItems,
      total: parseFloat(donatedBackFormData.total),
    };
    try {
      const docRef = await addDoc(collection(db, 'donationDetails'), newDonatedBack);
      fetchDonatedBack(donatedBackPage, donatedBackSearchText); // Refresh pagination
      toast({ title: 'Success', description: 'Donated back added', status: 'success', duration: 3000, isClosable: true });
      setDonatedBackFormData({ organizationName: '', count: '', items: '', typeOfItems: '', total: '' });
      setIsAddDonatedBackModalOpen(false);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to add donated back', status: 'error', duration: 3000, isClosable: true });
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string; value: string } }, type: 'donation' | 'donatedBack') => {
    const { name, value } = 'target' in e ? e.target : e;
    if (type === 'donation') {
      setDonationFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setDonatedBackFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          onClick={() => setPage(i)}
          colorScheme={currentPage === i ? 'blue' : 'gray'}
          variant={currentPage === i ? 'solid' : 'outline'}
          size="sm"
          mx={1}
        >
          {i}
        </Button>
      );
    }
    return (
      <HStack mt={4} justify="center">
        <Button
          onClick={() => setPage(currentPage - 1)}
          isDisabled={currentPage === 1}
          colorScheme="blue"
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        {pages}
        <Button
          onClick={() => setPage(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          colorScheme="blue"
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </HStack>
    );
  };

  return (
    <AdminLayout>
      <VStack spacing={8} align="stretch">
        {/* Donors Section */}
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" wrap="wrap" spacing={3}>
            <Heading as="h1" size="lg" fontWeight="bold">
              Donors ({allDonations.length})
            </Heading>
            <HStack spacing={3}>
              <Input
                placeholder="Search donors by name or reference"
                value={donationsSearchText}
                onChange={(e) => handleDonationsSearch(e.target.value)}
                w={{ base: 'full', md: '300px' }}
              />
              <Button onClick={() => fetchDonations(donationsPage, donationsSearchText)} isLoading={loading} colorScheme="blue">
                Refresh
              </Button>
              <Button onClick={() => setIsAddDonationModalOpen(true)} colorScheme="teal">
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
                {donationsData.map((record) => (
                  <Tr key={record.id}>
                    <Td><Text fontWeight="bold">{record.name}</Text></Td>
                    <Td><Badge colorScheme="green">{record.amount.toLocaleString()} MMK</Badge></Td>
                    <Td><Text fontFamily="monospace" color="gray.500" fontSize="sm">{record.compositeKey ? `${record.compositeKey.slice(0, 8)}...` : 'N/A'}</Text></Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FaGripVertical />} variant="ghost" />
                        <MenuList>
                          <MenuItem onClick={() => handleEditDonation(record)}>Edit</MenuItem>
                          <MenuItem onClick={() => handleDeleteDonation(record.id)}>Delete</MenuItem>
                          <MenuItem onClick={() => generateCertificate(record.name, record.amount)}>Generate Certificate</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          {renderPagination(donationsPage, donationsTotalPages, setDonationsPage)}
        </VStack>

        {/* Donated Back Section */}
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" wrap="wrap" spacing={3}>
            <Heading as="h2" size="md" fontWeight="bold">
              Donated Back ({allDonatedBack.length})
            </Heading>
            <HStack spacing={3}>
              <Input
                placeholder="Search donated back by organization or items"
                value={donatedBackSearchText}
                onChange={(e) => handleDonatedBackSearch(e.target.value)}
                w={{ base: 'full', md: '300px' }}
              />
              <Button onClick={() => fetchDonatedBack(donatedBackPage, donatedBackSearchText)} isLoading={donatedBackLoading} colorScheme="purple">
                Refresh
              </Button>
              <Button onClick={() => setIsAddDonatedBackModalOpen(true)} colorScheme="purple">
                Add Donated Back
              </Button>
            </HStack>
          </HStack>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Organization</Th>
                  <Th>Count</Th>
                  <Th>Items</Th>
                  <Th>Type</Th>
                  <Th>Total (MMK)</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {donatedBackData.map((record) => (
                  <Tr key={record.id}>
                    <Td><Text fontWeight="bold">{record.organizationName}</Text></Td>
                    <Td>{record.count.toLocaleString()}</Td>
                    <Td>{record.items}</Td>
                    <Td>{record.typeOfItems}</Td>
                    <Td><Badge colorScheme="purple">{record.total.toLocaleString()} MMK</Badge></Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<FaGripVertical />} variant="ghost" />
                        <MenuList>
                          <MenuItem onClick={() => handleEditDonatedBack(record)}>Edit</MenuItem>
                          <MenuItem onClick={() => handleDeleteDonatedBack(record.id)}>Delete</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
          {renderPagination(donatedBackPage, donatedBackTotalPages, setDonatedBackPage)}
        </VStack>

        {/* Add Donation Modal */}
        <Modal isOpen={isAddDonationModalOpen} onClose={() => setIsAddDonationModalOpen(false)}>
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
                    value={donationFormData.name}
                    onChange={(e) => handleFormChange(e, 'donation')}
                    placeholder="Enter donor name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Amount (MMK)</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="amount"
                      value={donationFormData.amount}
                      onChange={(e) => handleFormChange({ target: { name: 'amount', value: e.target.value } }, 'donation')}
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
              <Button variant="ghost" onClick={() => setIsAddDonationModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Donation Modal */}
        <Modal isOpen={isEditDonationModalOpen} onClose={() => setIsEditDonationModalOpen(false)}>
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
                    value={donationFormData.name}
                    onChange={(e) => handleFormChange(e, 'donation')}
                    placeholder="Enter donor name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Amount (MMK)</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="amount"
                      value={donationFormData.amount}
                      onChange={(e) => handleFormChange({ target: { name: 'amount', value: e.target.value } }, 'donation')}
                      placeholder="Enter donation amount"
                    />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleEditDonationSubmit} mr={3}>
                Update
              </Button>
              <Button variant="ghost" onClick={() => setIsEditDonationModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Donated Back Modal */}
        <Modal isOpen={isAddDonatedBackModalOpen} onClose={() => setIsAddDonatedBackModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Donated Back</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Organization Name</FormLabel>
                  <ChakraInput
                    name="organizationName"
                    value={donatedBackFormData.organizationName}
                    onChange={(e) => handleFormChange(e, 'donatedBack')}
                    placeholder="Enter organization name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Count</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="count"
                      value={donatedBackFormData.count}
                      onChange={(e) => handleFormChange({ target: { name: 'count', value: e.target.value } }, 'donatedBack')}
                      placeholder="Enter count"
                    />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Items</FormLabel>
                  <ChakraInput
                    name="items"
                    value={donatedBackFormData.items}
                    onChange={(e) => handleFormChange(e, 'donatedBack')}
                    placeholder="Enter items"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Type of Items</FormLabel>
                  <ChakraInput
                    name="typeOfItems"
                    value={donatedBackFormData.typeOfItems}
                    onChange={(e) => handleFormChange(e, 'donatedBack')}
                    placeholder="Enter type of items"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Total (MMK)</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="total"
                      value={donatedBackFormData.total}
                      onChange={(e) => handleFormChange({ target: { name: 'total', value: e.target.value } }, 'donatedBack')}
                      placeholder="Enter total amount"
                    />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" onClick={handleAddDonatedBack} mr={3}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsAddDonatedBackModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Donated Back Modal */}
        <Modal isOpen={isEditDonatedBackModalOpen} onClose={() => setIsEditDonatedBackModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Donated Back</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Organization Name</FormLabel>
                  <ChakraInput
                    name="organizationName"
                    value={donatedBackFormData.organizationName}
                    onChange={(e) => handleFormChange(e, 'donatedBack')}
                    placeholder="Enter organization name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Count</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="count"
                      value={donatedBackFormData.count}
                      onChange={(e) => handleFormChange({ target: { name: 'count', value: e.target.value } }, 'donatedBack')}
                      placeholder="Enter count"
                    />
                  </NumberInput>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Items</FormLabel>
                  <ChakraInput
                    name="items"
                    value={donatedBackFormData.items}
                    onChange={(e) => handleFormChange(e, 'donatedBack')}
                    placeholder="Enter items"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Type of Items</FormLabel>
                  <ChakraInput
                    name="typeOfItems"
                    value={donatedBackFormData.typeOfItems}
                    onChange={(e) => handleFormChange(e, 'donatedBack')}
                    placeholder="Enter type of items"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Total (MMK)</FormLabel>
                  <NumberInput min={1}>
                    <NumberInputField
                      name="total"
                      value={donatedBackFormData.total}
                      onChange={(e) => handleFormChange({ target: { name: 'total', value: e.target.value } }, 'donatedBack')}
                      placeholder="Enter total amount"
                    />
                  </NumberInput>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="purple" onClick={handleEditDonatedBackSubmit} mr={3}>
                Update
              </Button>
              <Button variant="ghost" onClick={() => setIsEditDonatedBackModalOpen(false)}>
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