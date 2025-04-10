'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Heading,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Icon,
  Link as ChakraLink,
  Center,
} from '@chakra-ui/react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { ArrowUpIcon, CopyIcon, ArrowLeftIcon } from '@chakra-ui/icons';
import { useToast } from '@chakra-ui/react';

const DonatePage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState({
    kbzPay: false,
    AYAPay: false,
    transactionKey: false,
  });
  const [uniqueKey, setUniqueKey] = useState<string>('');
  const toast = useToast();

  const qrImages = {
    kbzPay: '/images/wkhs_kbz.jpg',
    AYAPay: '/images/wkhs_aya.jpg',
  };

  // Generate a unique key when the component mounts
  useEffect(() => {
    const generateUniqueKey = (): string => {
      if (crypto?.randomUUID) {
        return crypto.randomUUID();
      }
      return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    };
    const key = generateUniqueKey();
    setUniqueKey(key);
  }, []);

  // Function to store the unique key in Firebase
  const storeUniqueKey = async (paymentMethod: string) => {
    try {
      const donationKeyData = {
        uniqueKey,
        paymentMethod,
        timestamp: new Date().toISOString(),
        status: 'pending',
      };
      await addDoc(collection(db, 'donationKeys'), donationKeyData);
      toast({
        title: 'Success',
        description: 'Donation key stored successfully!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error storing unique key:', error);
      toast({
        title: 'Error',
        description: 'Failed to store donation key.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Copy unique key to clipboard
  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(uniqueKey)
      .then(() => {
        toast({
          title: 'Success',
          description: 'Unique key copied to clipboard!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      })
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to copy unique key.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };

  return (
    <Box
      bg="white"
      minH="100vh"
      p={6}
      fontFamily="var(--font-jetbrains-mono), monospace"
      color="gray.800"
      textAlign="center"
      position="relative"
    >
      {/* Website Title */}
      <Heading
        as="h2"
        size="lg"
        position="absolute"
        top={6}
        left={6}
        color="blue.500"
        fontWeight="bold"
        zIndex={1000}
        textAlign="left"
      >
        Dev<span style={{ color: '#ff4d4f' }}>Aid</span>
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

      {/* Header Section */}
      <Box as="section" mb={10} pt={10}>
        <Heading as="h1" size="2xl" color="gray.800" fontWeight="bold" mb={4}>
          Donate to DevAid
        </Heading>
        <Text
          fontSize="md"
          color="gray.600"
          maxW="600px"
          mx="auto"
          lineHeight="tall"
        >
          Your donation will provide essential resources, support communities in need, and empower individuals to build a brighter future. Every contribution makes a difference!
        </Text>
      </Box>

      {/* Payments Section */}
      <Box as="section" mb={10}>
        <Heading
          as="h2"
          size="lg"
          color="gray.800"
          fontWeight="semibold"
          mb={8}
          textTransform="uppercase"
          letterSpacing="wide"
        >
          Payment Methods
        </Heading>
        <SimpleGrid columns={[1, 2, 2]} spacing={5} justifyItems="center">
          {/* KBZ Pay */}
          <Card
            w="120px"
            h="120px"
            rounded="lg"
            boxShadow="md"
            border="1px"
            borderColor="blue.50"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            transition="transform 0.3s ease"
            _hover={{ transform: 'translateY(-5px)' }}
            onClick={() => setModalVisible({ ...modalVisible, kbzPay: true })}
          >
            <CardBody p={2} textAlign="center">
              <Image
                src="/kpay.jpg"
                alt="KBZ Pay"
                width={60}
                height={60}
                style={{ marginBottom: '10px', objectFit: 'contain' }}
              />
              <Text fontSize="xs" color="gray.800" fontWeight="medium">
                KBZ Pay
              </Text>
            </CardBody>
          </Card>
          <Modal
            isOpen={modalVisible.kbzPay}
            onClose={() => {
              setModalVisible({ ...modalVisible, kbzPay: false });
              storeUniqueKey('KBZ Pay');
            }}
            isCentered
            size="xs"
          >
            <ModalOverlay />
            <ModalContent bg="white" color="gray.800">
              <ModalHeader>KBZ Pay Donation</ModalHeader>
              <ModalCloseButton />
              <ModalBody textAlign="center" pb={6}>
                <VStack spacing={4}>
                  <Image
                    src={qrImages.kbzPay}
                    alt="KBZ Pay QR Code"
                    width={200}
                    height={300}
                    style={{ margin: '0 auto' }}
                  />
                  <Text fontSize="sm" color="gray.800">
                    09765127445 <br />
                    Htet Yadanar Myo
                  </Text>
                  <Text fontSize="lg" color="gray.800">
                  Notes တွင်ကူးထည့်ပေးရန်: <strong>{uniqueKey}</strong>
                    <Button
                      variant="link"
                      leftIcon={<CopyIcon />}
                      onClick={copyToClipboard}
                      color="blue.500"
                      ml={2}
                    >
                      Copy
                    </Button>
                  </Text>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* AYA Pay */}
          <Card
            w="120px"
            h="120px"
            rounded="lg"
            boxShadow="md"
            border="1px"
            borderColor="blue.50"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            cursor="pointer"
            transition="transform 0.3s ease"
            _hover={{ transform: 'translateY(-5px)' }}
            onClick={() => setModalVisible({ ...modalVisible, AYAPay: true })}
          >
            <CardBody p={2} textAlign="center">
              <Image
                src="/aya.png"
                alt="AYA Pay"
                width={60}
                height={60}
                style={{ marginBottom: '10px', objectFit: 'contain' }}
              />
              <Text fontSize="xs" color="gray.800" fontWeight="medium">
                AYA Pay
              </Text>
            </CardBody>
          </Card>
          <Modal
            isOpen={modalVisible.AYAPay}
            onClose={() => {
              setModalVisible({ ...modalVisible, AYAPay: false });
              storeUniqueKey('AYA Pay');
            }}
            isCentered
            size="xs"
          >
            <ModalOverlay />
            <ModalContent bg="white" color="gray.800">
              <ModalHeader>AYA Pay Donation</ModalHeader>
              <ModalCloseButton />
              <ModalBody textAlign="center" pb={6}>
                <VStack spacing={4}>
                  <Image
                    src={qrImages.AYAPay}
                    alt="AYA Pay QR Code"
                    width={200}
                    height={300}
                    style={{ margin: '0 auto' }}
                  />
                  <Text fontSize="sm" color="gray.800">
                    09765127445 <br />
                    Htet Yadanar Myo
                  </Text>
                  <Text fontSize="sm" color="gray.800">
                    Paste Transaction Key in the notes: <strong>{uniqueKey}</strong>
                    <Button
                      variant="link"
                      leftIcon={<CopyIcon />}
                      onClick={copyToClipboard}
                      color="blue.500"
                      ml={2}
                    >
                      Copy
                    </Button>
                  </Text>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>
        </SimpleGrid>
      </Box>

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

export default DonatePage;