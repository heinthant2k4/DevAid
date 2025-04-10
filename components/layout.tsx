import React from "react";
import {
  Box,
  VStack,
  Text,
  Icon,
  Link as ChakraLink,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon} from "@chakra-ui/icons";
import { FaDashcube, FaTable } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/router";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isOpen, onToggle } = useDisclosure();

  // Map routes to menu keys
  const menuKeyMap: { [key: string]: string } = {
    "/dashboard": "dashboard",
    "/donations": "donations",
  };

  // Get the current menu key based on the route
  const selectedKey = menuKeyMap[router.pathname] || "";

  return (
    <Box minH="100vh" display="flex">
      {/* Sidebar */}
      <Box
        as="nav"
        w={isOpen ? "200px" : "60px"}
        bg="gray.800"
        color="white"
        transition="width 0.3s"
        position="fixed"
        h="100vh"
        zIndex={10}
      >
        <VStack spacing={0} align="stretch" h="full">
          {/* Logo/Title */}
          <Box p={4} textAlign="center">
            <Text fontSize="xl" fontWeight="bold" display={isOpen ? "block" : "none"}>
              Admin Panel
            </Text>
            <Icon
              as={isOpen ? CloseIcon : HamburgerIcon}
              boxSize={6}
              onClick={onToggle}
              cursor="pointer"
              display={{ base: "block", md: "block" }}
            />
          </Box>

          {/* Menu Items */}
          <VStack spacing={2} align="stretch" mt={4}>
            <ChakraLink
              as={Link}
              href="/dashboard"
              display="flex"
              alignItems="center"
              p={3}
              bg={selectedKey === "dashboard" ? "gray.700" : "transparent"}
              _hover={{ bg: "gray.700" }}
            >
              <Icon as={FaDashcube} boxSize={5} mr={isOpen ? 3 : 0} />
              <Text display={isOpen ? "block" : "none"}>Dashboard</Text>
            </ChakraLink>
            <ChakraLink
              as={Link}
              href="/donations"
              display="flex"
              alignItems="center"
              p={3}
              bg={selectedKey === "donations" ? "gray.700" : "transparent"}
              _hover={{ bg: "gray.700" }}
            >
              <Icon as={FaTable} boxSize={5} mr={isOpen ? 3 : 0} />
              <Text display={isOpen ? "block" : "none"}>Donations</Text>
            </ChakraLink>
          </VStack>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box
        flex={1}
        ml={isOpen ? "200px" : "60px"}
        transition="margin-left 0.3s"
        p={4}
        bg="white"
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;