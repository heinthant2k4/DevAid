'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Heading,
  VStack,
  HStack,
  Skeleton,
  Card,
  CardBody,
  Icon,
  Link as ChakraLink,
  Center,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import Link from 'next/link';
import { collection, query, limit, startAfter, getDocs, orderBy, startAt, where, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ArrowUpIcon, DownloadIcon, ArrowLeftIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { FaDollarSign } from 'react-icons/fa';

interface Donation {
  id: string;
  name: string;
  amount: number;
}

const PAGE_SIZE = 10;

const Donations: React.FC = () => {
  const [donationsData, setDonationsData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [firstDoc, setFirstDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [hasPrevious, setHasPrevious] = useState<boolean>(false);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [totalLoading, setTotalLoading] = useState<boolean>(true);
  const [totalError, setTotalError] = useState<string | null>(null);
  const [certificateLoading, setCertificateLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const toast = useToast();

  // Fetch total donations (similar to Dashboard's fetchTotalDonations)
  const fetchTotalDonations = async () => {
    try {
      setTotalLoading(true);
      setTotalError(null);
      const snapshot = await getDocs(collection(db, 'donations'));
      const total = snapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.amount || 0);
      }, 0);
      setTotalDonations(total);
    } catch (error) {
      console.error('Error fetching total donations:', error);
      setTotalError('Failed to fetch total donations.');
    } finally {
      setTotalLoading(false);
    }
  };

  // Fetch donations with pagination and search (inspired by Dashboard simplicity)
  const fetchDonations = async (loadMore = false, loadPrevious = false, search = '') => {
    try {
      setLoading(true);
      setError(null);
      let q = query(collection(db, 'donations'), orderBy('amount', 'desc'), limit(PAGE_SIZE));

      if (search) {
        q = query(
          collection(db, 'donations'),
          where('name', '>=', search),
          where('name', '<=', search + '\uf8ff'),
          orderBy('name'),
          limit(PAGE_SIZE)
        );
      } else if (loadMore && lastDoc) {
        q = query(collection(db, 'donations'), orderBy('amount', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      } else if (loadPrevious && firstDoc) {
        q = query(collection(db, 'donations'), orderBy('amount', 'desc'), startAt(firstDoc), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      const fetchedDonations = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.data().donorName || 'Unknown',
        amount: doc.data().amount || 0,
      }));

      setDonationsData((prev) => {
        let newData: Donation[] = [];
        if (loadMore) newData = [...prev, ...fetchedDonations];
        else if (loadPrevious) newData = [...fetchedDonations, ...prev];
        else newData = fetchedDonations;
        return newData;
      });

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setFirstDoc(snapshot.docs[0] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setHasPrevious(donationsData.length > 0 && !loadMore);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to fetch donations.');
    } finally {
      setLoading(false);
    }
  };

  // Generate certificate (with toast feedback like Dashboard)
  const generateCertificate = async (record: Donation) => {
    setCertificateLoading(record.id);
    try {
      const templateBytes = await fetch('/certi.pdf').then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(templateBytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.getPage(0);
      page.drawText(record.name, { x: 130, y: 275, size: 16, font, color: rgb(0, 0, 0) });
      page.drawText(`MMK ${record.amount.toLocaleString()}`, { x: 250, y: 355, size: 20, font, color: rgb(0, 0, 0) });
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${record.name}_certificate.pdf`;
      link.click();
      toast({
        title: 'Success',
        description: `${record.name}'s certificate downloaded.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Certificate error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate certificate.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setCertificateLoading(null);
    }
  };

  // Handle search input (simple, like Dashboard's handleInputChange)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchDonations(false, false, value); // Immediate fetch like Dashboard
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchDonations();
  };

  useEffect(() => {
    fetchTotalDonations();
    fetchDonations();
  }, []);

  return (
    <Box bg="gray.50" minH="100vh" p={8} fontFamily="var(--font-jetbrains-mono), monospace">
      {/* Header */}
      <Heading as="h2" size="lg" position="absolute" top={8} left={8} color="blue.600" fontWeight="bold">
        Dev<span style={{ color: '#ff4d4f' }}>Aid</span>
      </Heading>
      <Heading as="h1" size="xl" textAlign="center" mb={6} color="gray.800">
        Donations
      </Heading>

      {/* Search Input */}
      <InputGroup maxW="400px" mx="auto" mb={6}>
        <Input
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by donor name"
          size="lg"
          bg="white"
          borderColor="blue.200"
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px #3182ce' }}
          aria-label="Search donations"
        />
        <InputRightElement>
          {searchQuery ? (
            <CloseIcon color="gray.400" cursor="pointer" onClick={clearSearch} />
          ) : (
            <SearchIcon color="gray.400" />
          )}
        </InputRightElement>
      </InputGroup>

      {/* Scroll to Top Button */}
      <Button
        position="fixed"
        bottom={8}
        right={8}
        zIndex={1000}
        bg="blue.500"
        color="white"
        rounded="full"
        size="lg"
        p={3}
        _hover={{ bg: 'blue.600' }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
      >
        <ArrowUpIcon />
      </Button>

      {/* Total Donations Card */}
      <Center mb={8}>
        {totalLoading ? (
          <Skeleton height="120px" width="400px" rounded="lg" />
        ) : totalError ? (
          <VStack maxW="400px" w="full" textAlign="center" spacing={4}>
            <Text color="red.500" fontSize="lg">{totalError}</Text>
            <Button colorScheme="blue" onClick={fetchTotalDonations}>Retry</Button>
          </VStack>
        ) : (
          <Card maxW="400px" w="full" textAlign="center" rounded="lg" boxShadow="lg" bg="white">
            <CardBody p={6}>
              <HStack justify="center" spacing={3}>
                
                <VStack spacing={1}>
                  <Text fontSize="md" color="gray.600">Total Donations</Text>
                  <Heading as="h3" size="lg" color="green.500">
                  <Icon as={FaDollarSign} color="green.500" boxSize={6} />
                    {totalDonations.toLocaleString()} MMK
                  </Heading>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        )}
      </Center>

      {/* Donations Table */}
      <Card boxShadow="lg" bg="white" rounded="lg" overflow="hidden">
        <CardBody p={0}>
          {loading && !donationsData.length ? (
            <VStack p={6} spacing={4}>
              <Spinner size="lg" color="blue.500" />
              <Text>Loading donations...</Text>
            </VStack>
          ) : error ? (
            <VStack p={6} spacing={4}>
              <Text color="red.500" fontSize="lg">{error}</Text>
              <Button colorScheme="blue" onClick={() => fetchDonations()}>Retry</Button>
            </VStack>
          ) : donationsData.length === 0 ? (
            <Center p={6}>
              <Text fontSize="lg" color="gray.500">No donations found.</Text>
            </Center>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="blue.500" position="sticky" top={0} zIndex={10}>
                  <Tr>
                    <Th color="white" py={4} fontSize="sm">Donor Name</Th>
                    <Th color="white" py={4} fontSize="sm">Amount (MMK)</Th>
                    <Th color="white" py={4} fontSize="sm">Certificate</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {donationsData.map((record, index) => (
                    <Tr
                      key={record.id}
                      bg={index % 2 === 0 ? 'gray.50' : 'white'}
                      _hover={{ bg: 'blue.50' }}
                      transition="background-color 0.2s ease"
                    >
                      <Td py={4} color="gray.800">{record.name}</Td>
                      <Td py={4}>
                        <Text fontWeight="semibold" color="green.600">
                          {record.amount.toLocaleString()} MMK
                        </Text>
                      </Td>
                      <Td py={4}>
                        <Button
                          size="sm"
                          leftIcon={<DownloadIcon />}
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => generateCertificate(record)}
                          isLoading={certificateLoading === record.id}
                          isDisabled={certificateLoading === record.id}
                          _hover={{ bg: 'blue.100' }}
                          aria-label={`Download certificate for ${record.name}`}
                        >
                          Download
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {donationsData.length > 0 && !error && (
        <Center mt={6}>
          <HStack spacing={4}>
            <Button
              onClick={() => fetchDonations(false, true)}
              isLoading={loading}
              isDisabled={!hasPrevious || loading}
              colorScheme="blue"
              variant="outline"
              _hover={{ bg: 'blue.100' }}
            >
              Previous
            </Button>
            <Text fontSize="sm" color="gray.600">
              Showing {donationsData.length} donations
            </Text>
            <Button
              onClick={() => fetchDonations(true)}
              isLoading={loading}
              isDisabled={!hasMore || loading}
              colorScheme="blue"
              variant="outline"
              _hover={{ bg: 'blue.100' }}
            >
              Next
            </Button>
          </HStack>
        </Center>
      )}

      {/* Back to Home */}
      <Center mt={10}>
        <Link href="/" passHref>
          <ChakraLink>
            <Button
              leftIcon={<ArrowLeftIcon />}
              colorScheme="blue"
              variant="outline"
              size="lg"
              _hover={{ bg: 'blue.100' }}
            >
              Back to Home
            </Button>
          </ChakraLink>
        </Link>
      </Center>
    </Box>
  );
};

export default Donations;