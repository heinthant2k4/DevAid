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
  Spinner,
  Center,
} from '@chakra-ui/react';
import Link from 'next/link';
import { collection, query, limit, startAfter, getDocs, orderBy, startAt, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ArrowUpIcon, DownloadIcon, ArrowLeftIcon } from '@chakra-ui/icons';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

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

  // Fetch the total sum of all donations
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
      setTotalError('Failed to fetch total donations. Please try again.');
    } finally {
      setTotalLoading(false);
    }
  };

  // Fetch donations from Firestore
  const fetchDonations = async (loadMore: boolean = false, loadPrevious: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      let q = query(collection(db, 'donations'), orderBy('amount', 'desc'), limit(PAGE_SIZE));

      if (loadMore && lastDoc) {
        q = query(collection(db, 'donations'), orderBy('amount', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));
      } else if (loadPrevious && firstDoc) {
        q = query(collection(db, 'donations'), orderBy('amount', 'desc'), startAt(firstDoc), limit(PAGE_SIZE));
      }

      const snapshot = await getDocs(q);
      console.log('Fetched documents:', snapshot.docs.length);

      const fetchedDonations = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || data.donorName || 'Unknown',
          amount: data.amount || 0,
        };
      });

      setDonationsData((prev) => {
        let newData: Donation[] = [];
        if (loadMore) {
          newData = [...prev, ...fetchedDonations];
        } else if (loadPrevious) {
          newData = [...fetchedDonations, ...prev];
        } else {
          newData = fetchedDonations;
        }
        return newData;
      });

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setFirstDoc(snapshot.docs[0] || null);
      setHasMore(snapshot.docs.length === PAGE_SIZE);
      setHasPrevious(donationsData.length > 0 && !loadMore);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setError('Failed to fetch donations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to generate and download the certificate
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
    } catch (error) {
      console.error('Certificate error:', error);
    } finally {
      setCertificateLoading(null);
    }
  };

  useEffect(() => {
    fetchTotalDonations();
    fetchDonations();
  }, []);

  return (
    <Box
      bg="white"
      color="black"
      minH="100vh"
      p={6}
      fontFamily="var(--font-jetbrains-mono), monospace"
      position="relative"
    >
      {/* Dev Aid Title */}
      <Heading
        as="h2"
        size="lg"
        position="absolute"
        top={6}
        left={6}
        color="blue.500"
        fontWeight="bold"
        zIndex={1000}
      >
        Dev<span style={{ color: '#ff4d4f' }}>Aid</span>
      </Heading>

      {/* Header */}
      <Heading as="h1" size="2xl" textAlign="center" mb={4} color="gray.800" fontWeight="bold">
        Donations
      </Heading>

      {/* Scroll to Top Button */}
      <Button
        position="fixed"
        bottom={10}
        right={10}
        zIndex={1000}
        bg="white"
        border="1px"
        borderColor="blue.500"
        rounded="full"
        size="lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        _hover={{ bg: 'blue.50' }}
      >
        <Icon as={ArrowUpIcon} color="blue.500" />
      </Button>

      {/* Total Donations Card */}
      <Center mb={6}>
        {totalLoading ? (
          <Skeleton height="100px" width="400px" />
        ) : totalError ? (
          <VStack maxW="400px" w="full" textAlign="center">
            <Text color="red.500" fontSize="lg">
              {totalError}
            </Text>
            <Button
              colorScheme="blue"
              onClick={fetchTotalDonations}
              rounded="md"
              fontWeight="medium"
              px={6}
              py={4}
            >
              Retry
            </Button>
          </VStack>
        ) : (
          <Card
            maxW="400px"
            w="full"
            textAlign="center"
            rounded="xl"
            boxShadow="md"
            border="1px"
            borderColor="blue.50"
          >
            <CardBody p={4}>
              <Heading as="h4" size="md" color="gray.600" mb={2}>
                Thank you for your generous support!
              </Heading>
              <Heading as="h3" size="lg" color="green.500">
                Total Donations: {totalDonations.toLocaleString()} MMK
              </Heading>
            </CardBody>
          </Card>
        )}
      </Center>

      {/* Table */}
      <Box overflowX="auto">
        {loading && !donationsData.length ? (
          <Skeleton height="200px" />
        ) : error ? (
          <VStack textAlign="center" mb={6}>
            <Text color="red.500" fontSize="lg">
              {error}
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => fetchDonations()}
              rounded="md"
              fontWeight="medium"
              px={6}
              py={4}
            >
              Retry
            </Button>
          </VStack>
        ) : donationsData.length === 0 ? (
          <Center>
            <Text fontSize="lg" color="gray.500">
              No donations found.
            </Text>
          </Center>
        ) : (
          <Table variant="simple" bg="white" rounded="md" overflow="hidden">
            <Thead bg="blue.50">
              <Tr>
                <Th color="black" fontWeight="semibold" py={3}>
                  Donor Name
                </Th>
                <Th color="black" fontWeight="semibold" py={3}>
                  Amount (MMK)
                </Th>
                <Th color="black" fontWeight="semibold" py={3}>
                  Certificate
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {donationsData.map((record, index) => (
                <Tr
                  key={record.id}
                  bg={index % 2 === 0 ? 'gray.50' : 'white'}
                  _hover={{ bg: 'blue.50', transition: 'background-color 0.2s ease' }}
                >
                  <Td py={3} color="black">
                    {record.name}
                  </Td>
                  <Td py={3}>
                    <Text fontWeight="medium" color="green.500">
                      {record.amount.toLocaleString()} MMK
                    </Text>
                  </Td>
                  <Td py={3}>
                    <Button
                      size="sm"
                      leftIcon={<DownloadIcon />}
                      bg="blue.50"
                      color="blue.500"
                      onClick={() => generateCertificate(record)}
                      isLoading={certificateLoading === record.id}
                      rounded="md"
                      _hover={{ bg: 'blue.100' }}
                    >
                      View Certificate
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* Pagination Buttons */}
      {donationsData.length > 0 && !error && (
        <Center mt={6}>
          <HStack spacing={4}>
            {hasPrevious && (
              <Button
                onClick={() => fetchDonations(false, true)}
                isLoading={loading}
                bg="blue.50"
                color="blue.500"
                rounded="md"
                fontWeight="medium"
                px={6}
                py={4}
                _hover={{ bg: 'blue.100' }}
              >
                Load Previous
              </Button>
            )}
            {hasMore && (
              <Button
                onClick={() => fetchDonations(true)}
                isLoading={loading}
                bg="blue.50"
                color="blue.500"
                rounded="md"
                fontWeight="medium"
                px={6}
                py={4}
                _hover={{ bg: 'blue.100' }}
              >
                Load More
              </Button>
            )}
          </HStack>
        </Center>
      )}

      {/* Back to Home Button */}
      <Center mt={10}>
        <Link href="/" passHref>
          <ChakraLink>
            <Button
              leftIcon={<ArrowLeftIcon />}
              bg="white"
              color="black"
              border="1px"
              borderColor="black"
              rounded="md"
              fontWeight="medium"
              px={6}
              py={4}
              _hover={{ bg: 'blue.50' }}
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