'use client';

import React from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Heading,
  Button,
  Image,
  Flex,
  Text,
} from '@chakra-ui/react';
import Link from 'next/link';

const ImageDetail: React.FC = () => {
  const router = useRouter();
  const { image } = router.query; // Get image URL from query parameter

  return (
    <Box
      bg="#ffffff"
      color="#000000"
      minH="100vh"
      p={6}
      fontFamily="var(--font-jetbrains-mono), monospace"
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
    >
      <Heading
        as="h2"
        size="lg"
        color="#1890ff"
        mb={6}
        textAlign="center"
      >
        Dev<span style={{ color: '#ff4d4f' }}>Aid</span> 
      </Heading>

      {image ? (
        <Flex direction="column" align="center" maxW="100%" w={{ base: '100%', md: '80%' }}>
          <Image
            src={typeof image === 'string' ? image : '/images/placeholder.jpg'}
            alt="Full social media footage"
            fallbackSrc="/images/placeholder.jpg"
            maxW="100%"
            maxH="80vh"
            objectFit="contain" // Ensure full image is visible without cropping
            borderRadius="md"
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.1)"
            mb={4}
          />
          <Text fontSize="sm" color="#666666" mb={4}>
            Social Media Footage
          </Text>
          <Button
            as={Link}
            href="/"
            size="lg"
            bg="#1890ff"
            color="#ffffff"
            borderRadius="md"
            _hover={{ bg: '#40a9ff' }}
          >
            Back to Home
          </Button>
        </Flex>
      ) : (
        <Text color="#ff4d4f" fontSize="lg">
          No image specified.
        </Text>
      )}
    </Box>
  );
};

export default ImageDetail;