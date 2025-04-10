'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Skeleton,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { FaDollarSign, FaEye, FaArrowUp } from 'react-icons/fa';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

interface Donation {
  id: string;
  name: string;
  amount: number;
  compositeKey: string;
}

const Home: React.FC = () => {
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [totalDonated] = useState<number>(185000);
  const [totalDonors, setTotalDonors] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Fetch data from Firestore on component mount
  const fetchDonationStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const snapshot = await getDocs(collection(db, 'donations'));
      const donations: Donation[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || doc.data().donorName || 'Unknown',
        amount: doc.data().amount || 0,
        compositeKey: doc.data().compositeKey || 'N/A',
      }));

      // Calculate total donations (sum of amounts)
      const sum = donations.reduce((acc, donation) => acc + (Number(donation.amount) || 0), 0);
      setTotalDonations(sum);

      // Set total donors (count of unique donors)
      const uniqueDonors = new Set(donations.map((donation) => donation.name || 'Anonymous')).size;
      setTotalDonors(uniqueDonors);

      console.log('Fetched donations:', donations);
      console.log('Total donations:', sum);
      console.log('Total donors:', uniqueDonors);
    } catch (error) {
      console.error('Error fetching donation stats:', error);
      setError('Failed to fetch donation stats. Please try again.');
      toast({
        title: 'Error',
        description: 'Failed to fetch donation stats.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonationStats();
  }, []);

  return (
    <Box
      bg="#ffffff"
      color="#000000"
      minH="100vh"
      p={6}
      fontFamily="var(--font-jetbrains-mono), monospace"
    >
      {/* Website Title */}
      <Heading
        as="h2"
        size="lg"
        color="#1890ff"
        position="absolute"
        top={6}
        left={6}
        m={0}
        zIndex={1000}
        w="100%"
      >
        Dev<span style={{ color: '#ff4d4f' }}>Aid</span>
      </Heading>

      {/* Scroll to Top Button */}
      <IconButton
        aria-label="Scroll to top"
        icon={<FaArrowUp />}
        size="lg"
        position="fixed"
        bottom="40px"
        right="40px"
        zIndex={1000}
        bg="#ffffff"
        border="1px solid"
        borderColor="#1890ff"
        color="#1890ff"
        borderRadius="full"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        _hover={{ bg: '#e6f7ff' }}
      />

      {/* Hero Section */}
      <Box
        as="section"
        textAlign="center"
        py={{ base: 10, md: 16 }}
        px={5}
        mb={10}
        borderBottom="1px solid #ddd"
      >
        <Heading
          as="h1"
          size="2xl"
          color="#1a1a1a"
          fontWeight={700}
          mb={4}
        >
          Myanmar Earthquake Relief Fund
        </Heading>
        <Text
          fontSize="lg"
          maxW="600px"
          mx="auto"
          mb={8}
          color="#666666"
          lineHeight="1.6"
        >
          DevAid, a passionate student organization from UIT, is dedicated to making a difference. We provide emergency aid and recovery support to Myanmar@aps earthquake victims, helping people rebuild their lives with hope and dignity.
        </Text>
        <Flex
          justify="center"
          gap={4}
          flexWrap="wrap"
        >
          <Button
            as={Link}
            href="/donate"
            leftIcon={<FaDollarSign />}
            size="lg"
            bg="#1890ff"
            color="#ffffff"
            borderRadius="md"
            fontWeight="medium"
            px={6}
            _hover={{ bg: '#40a9ff' }}
            transition="background-color 0.3s ease, border-color 0.3s ease"
          >
            Donate Now
          </Button>
          <Button
            as={Link}
            href="/view_donations"
            leftIcon={<FaEye />}
            size="lg"
            bg="#ffffff"
            color="#000000"
            border="1px solid #000000"
            borderRadius="md"
            fontWeight="medium"
            px={6}
            _hover={{ bg: '#e6f7ff' }}
            transition="background-color 0.3s ease"
          >
            View Donations
          </Button>
        </Flex>
      </Box>

      {/* Earthquake & Relief Efforts Section */}
      <Box as="section" mb={10}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="center"
          gap={5}
        >
          <Box
            borderRadius="lg"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
            border="1px solid #e6f7ff"
            p={4}
            w={{ base: '100%', md: '50%' }}
            maxW={{ md: '400px' }}
          >
            <Heading
              as="h3"
              size="lg"
              color="#1a1a1a"
              fontWeight={500}
              mb={4}
            >
              About the Earthquake
            </Heading>
            <Text
              fontSize="sm"
              color="#666666"
              lineHeight="1.6"
            >
              On March 28, 2025, a 7.7-magnitude earthquake hit Myanmar near Mandalay, followed by a 6.4-magnitude aftershock. It claimed over 3,000 lives, demolished infrastructure, and displaced thousands, worsening the crisis.
            </Text>
          </Box>
          <Box
            borderRadius="lg"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
            border="1px solid #e6f7ff"
            p={4}
            w={{ base: '100%', md: '50%' }}
            maxW={{ md: '400px' }}
          >
            <Heading
              as="h3"
              size="lg"
              color="#1a1a1a"
              fontWeight={500}
              mb={4}
            >
              Our Relief Efforts
            </Heading>
            <Text
              fontSize="sm"
              color="#666666"
              lineHeight="1.6"
            >
              DevAid’s team delivers food, medical camps, and shelters, collaborating with local NGOs and aiding mental health and education for affected children.
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Impact Stats */}
      <Box as="section" textAlign="center" mb={10}>
        {loading ? (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="center"
            gap={5}
          >
            <Skeleton height="120px" w={{ base: '100%', md: '300px' }} />
            <Skeleton height="120px" w={{ base: '100%', md: '300px' }} />
            <Skeleton height="120px" w={{ base: '100%', md: '300px' }} />
          </Flex>
        ) : error ? (
          <Box textAlign="center" mb={6}>
            <Text color="#ff4d4f" fontSize="lg">
              {error}
            </Text>
            <Button
              onClick={fetchDonationStats}
              bg="#1890ff"
              color="#ffffff"
              borderRadius="md"
              fontWeight="medium"
              px={6}
              mt={4}
              _hover={{ bg: '#40a9ff' }}
            >
              Retry
            </Button>
          </Box>
        ) : (
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="center"
            gap={5}
          >
            <Box
              borderRadius="lg"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
              border="1px solid #e6f7ff"
              p={4}
              w={{ base: '100%', md: '300px' }}
              textAlign="center"
            >
              <Heading as="h4" size="md" color="#666666" mb={2}>
                Total Donations
              </Heading>
              <Heading as="h3" size="lg" color="#389e0d">
                {totalDonations.toLocaleString()} MMK
              </Heading>
            </Box>
            <Box
              borderRadius="lg"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
              border="1px solid #e6f7ff"
              p={4}
              w={{ base: '100%', md: '300px' }}
              textAlign="center"
            >
              <Heading as="h4" size="md" color="#666666" mb={2}>
                Total Donated
              </Heading>
              <Heading as="h3" size="lg" color="#389e0d">
                {totalDonated.toLocaleString()} MMK
              </Heading>
            </Box>
            <Box
              borderRadius="lg"
              boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
              border="1px solid #e6f7ff"
              p={4}
              w={{ base: '100%', md: '300px' }}
              textAlign="center"
            >
              <Heading as="h4" size="md" color="#666666" mb={2}>
                Total Donors
              </Heading>
              <Heading as="h3" size="lg" color="#1a1a1a">
                {totalDonors.toLocaleString()}
              </Heading>
            </Box>
          </Flex>
        )}
      </Box>

      {/* Call to Action */}
      <Box
        as="section"
        textAlign="center"
        py={10}
        px={5}
        bg="#ffffff"
        borderRadius="lg"
      >
        <Heading
          as="h2"
          size="xl"
          color="#1a1a1a"
          mb={4}
          fontWeight={600}
        >
          Support the Recovery
        </Heading>
        <Text
          fontSize="lg"
          maxW="600px"
          mx="auto"
          mb={8}
          color="#666666"
          lineHeight="1.6"
        >
          Your donation aids earthquake victims in Myanmar with essentials and recovery support.
        </Text>
        <Flex
          justify="center"
          gap={4}
          flexWrap="wrap"
        >
          <Button
            as={Link}
            href="/donate"
            leftIcon={<FaDollarSign />}
            size="lg"
            bg="#1890ff"
            color="#ffffff"
            borderRadius="md"
            fontWeight="medium"
            px={6}
            _hover={{ bg: '#40a9ff' }}
            transition="background-color 0.3s ease, border-color 0.3s ease"
          >
            Donate Now
          </Button>
          <Button
            as={Link}
            href="/view_donations"
            leftIcon={<FaEye />}
            size="lg"
            bg="#ffffff"
            color="#000000"
            border="1px solid #000000"
            borderRadius="md"
            fontWeight="medium"
            px={6}
            _hover={{ bg: '#e6f7ff' }}
            transition="background-color 0.3s ease"
          >
            View Donations
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default Home;