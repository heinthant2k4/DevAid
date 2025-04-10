'use client';

import React, { useState } from 'react';
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
import { ArrowUpIcon, ArrowLeftIcon } from '@chakra-ui/icons';

const DonatePage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState({
    kbzPay: false,
    AYAPay: false,
  });

  const qrImages = {
    kbzPay: '/images/wkhs_kbz.jpg',
    AYAPay: '/images/wkhs_aya.jpg',
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
            onClose={() => setModalVisible({ ...modalVisible, kbzPay: false })}
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
                  <Text fontSize="lg" color="gray.800" p={3}>
                    Transaction လေးပြီးရင် Telegram -{' '}
                    <strong>@thutahuang</strong> <strong>@whks3777</strong> ကို ပြောပေးပါ။
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
            onClose={() => setModalVisible({ ...modalVisible, AYAPay: false })}
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
                  <Text fontSize="lg" color="gray.800" p={3}>
                    Transaction လေးပြီးရင် Telegram -{' '}
                    <strong>@thutahuang</strong> <strong>@whks3777</strong> ကို ပြောပေးပါ။
                  </Text>
                </VStack>
              </ModalBody>
            </ModalContent>
          </Modal>
        </SimpleGrid>
      </Box>

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

export default DonatePage;
