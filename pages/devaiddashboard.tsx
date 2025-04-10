import React, { useEffect, useState } from "react";
import AdminLayout from "../components/layout";
import {
  Box,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { FaDollarSign, FaUser, FaHandHoldingHeart, FaPlusCircle } from "react-icons/fa";
import { useToast } from "@chakra-ui/react";

interface TopDonor {
  id: string;
  name: string;
  amount: number;
}

interface DonatedBack {
  id: string;
  organizationName: string;
  count: number;
  items: string;
  typeOfItems: string;
  total: number;
}

const Dashboard: React.FC = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [amountDonatedBack, setAmountDonatedBack] = useState(0);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [donatedBackData, setDonatedBackData] = useState<DonatedBack[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    count: "",
    items: "",
    typeOfItems: "",
    total: "",
  });
  const toast = useToast();

  // Fetch total donations and donors
  const fetchTotalDonations = async () => {
    const snapshot = await getDocs(collection(db, "donations"));
    const donations = snapshot.docs.map((doc) => doc.data());
    const totalAmount = donations.reduce((sum, donation) => {
      const amount = parseFloat(donation.amount) || 0;
      return sum + amount;
    }, 0);
    const uniqueDonors = new Set(donations.map((donation) => donation.name || "Anonymous")).size;
    setTotalDonations(totalAmount);
    setTotalDonors(uniqueDonors);
  };

  // Fetch amount donated back and donated back details
  const fetchAmountDonatedBack = async () => {
    const snapshot = await getDocs(collection(db, "donationDetails"));
    const donationDetails = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { organizationName?: string; count?: number; items?: string; typeOfItems?: string; total?: number }),
    }));
    const totalDonatedBack = donationDetails.reduce((sum, detail) => sum + (detail.total || 0), 0);
    setAmountDonatedBack(totalDonatedBack);
    setDonatedBackData(
      donationDetails.map((detail) => ({
        id: detail.id,
        organizationName: detail.organizationName || "Unknown",
        count: detail.count || 0,
        items: detail.items || "N/A",
        typeOfItems: detail.typeOfItems || "N/A",
        total: detail.total || 0,
      }))
    );
  };

  // Fetch top donors
  const fetchTopDonors = async () => {
    const snapshot = await getDocs(collection(db, "donations"));
    const donations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { name?: string; amount?: number }),
    }));
    const sortedDonations = donations
      .map((donation) => ({
        id: donation.id,
        name: donation.name || "Anonymous",
        amount: donation.amount || 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5); // Top 5 donors
    setTopDonors(sortedDonations);
  };

  // Add new donated back entry
  const handleAddDonation = async () => {
    try {
      const newDonation = {
        organizationName: formData.organizationName,
        amount: parseFloat(formData.count) || 0,
        items: formData.items,
        typeOfItems: formData.typeOfItems,
        total: parseFloat(formData.total) || 0,
        createdAt: new Date().toISOString(),
      };
      await addDoc(collection(db, "donationDetails"), newDonation);
      toast({
        title: "Success",
        description: "Donation added successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFormData({
        organizationName: "",
        count: "",
        items: "",
        typeOfItems: "",
        total: "",
      });
      setIsModalOpen(false);
      // Refresh donated back data
      await fetchAmountDonatedBack();
    } catch (error) {
      console.error("Error adding donation:", error);
      toast({
        title: "Error",
        description: "Failed to add donation.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTotalDonations(), fetchAmountDonatedBack(), fetchTopDonors()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AdminLayout>
      <Box p={6} bg="gray.100">
        <Heading as="h1" size="xl" mb={6} color="blue.500" fontWeight="bold">
          Dashboard
        </Heading>
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : (
          <>
            <SimpleGrid columns={[1, 1, 3]} spacing={4} mb={6}>
              {/* Total Donations */}
              <Card bg="teal.400" color="white" boxShadow="md">
                <CardHeader>
                  <Heading size="md">Total Donations</Heading>
                </CardHeader>
                <CardBody display="flex" alignItems="center">
                  <Icon as={FaDollarSign} boxSize={6} mr={2} />
                  <Text fontSize="xl" fontWeight="bold">
                    MMK {totalDonations.toLocaleString()}
                  </Text>
                </CardBody>
              </Card>
              {/* Total Donors */}
              <Card bg="orange.400" color="white" boxShadow="md">
                <CardHeader>
                  <Heading size="md">Total Donors</Heading>
                </CardHeader>
                <CardBody display="flex" alignItems="center">
                  <Icon as={FaDollarSign} boxSize={6} mr={2} />
                  <Text fontSize="xl" fontWeight="bold">
                    {totalDonors.toLocaleString()}
                  </Text>
                </CardBody>
              </Card>
              {/* Amount Donated Back */}
              <Card bg="yellow.400" color="white" boxShadow="md">
                <CardHeader>
                  <Heading size="md">Amount Donated Back</Heading>
                </CardHeader>
                <CardBody display="flex" alignItems="center">
                  <Icon as={FaHandHoldingHeart} boxSize={6} mr={2} />
                  <Text fontSize="xl" fontWeight="bold">
                    MMK {amountDonatedBack.toLocaleString()}
                  </Text>
                </CardBody>
              </Card>
            </SimpleGrid>

            <SimpleGrid columns={[1, 1, 2]} spacing={4}>
              {/* Top Donors Table */}
              <Card bg="blue.500" boxShadow="md">
                <CardHeader>
                  <Heading size="md" color="white">
                    Top Donors
                  </Heading>
                </CardHeader>
                <CardBody bg="white" roundedBottom="md">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Donor Name</Th>
                        <Th>Amount (MMK)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topDonors.map((donor) => (
                        <Tr key={donor.id}>
                          <Td>
                            <Text color="blue.500" fontWeight="semibold">
                              {donor.name}
                            </Text>
                          </Td>
                          <Td>
                            <Badge colorScheme="teal" p={1}>
                              {donor.amount.toLocaleString()} MMK
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>

              {/* Donated Back Table */}
              <Card bg="purple.500" boxShadow="md">
                <CardHeader display="flex" justifyContent="space-between" alignItems="center">
                  <Heading size="md" color="white">
                    Donated Back Details
                  </Heading>
                  <Button
                    leftIcon={<FaPlusCircle />}
                    colorScheme="teal"
                    size="sm"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add Donation
                  </Button>
                </CardHeader>
                <CardBody bg="white" roundedBottom="md">
                  {donatedBackData.length > 0 ? (
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Organization</Th>
                          <Th>Count</Th>
                          <Th>Items</Th>
                          <Th>Type</Th>
                          <Th>Total (MMK)</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {donatedBackData.map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.organizationName}</Td>
                            <Td>{item.count.toLocaleString()}</Td>
                            <Td>{item.items}</Td>
                            <Td>{item.typeOfItems}</Td>
                            <Td>{item.total.toLocaleString()}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  ) : (
                    <Text textAlign="center" color="gray.500">
                      No data available
                    </Text>
                  )}
                </CardBody>
              </Card>
            </SimpleGrid>
          </>
        )}

        {/* Add Donation Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Donation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Organization Name</FormLabel>
                  <Input
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="Enter organization name"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Count</FormLabel>
                  <Input
                    name="count"
                    type="number"
                    value={formData.count}
                    onChange={handleInputChange}
                    placeholder="Enter items amount"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Items</FormLabel>
                  <Input
                    name="items"
                    value={formData.items}
                    onChange={handleInputChange}
                    placeholder="Enter items (e.g., Books, Clothes)"
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Type of Items</FormLabel>
                  <Select
                    name="typeOfItems"
                    value={formData.typeOfItems}
                    onChange={handleInputChange}
                    placeholder="Select type"
                  >
                    <option value="Material">Material</option>
                    <option value="Financial">Financial</option>
                    <option value="Services">Services</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Total Amount (MMK)</FormLabel>
                  <Input
                    name="total"
                    type="number"
                    value={formData.total}
                    onChange={handleInputChange}
                    placeholder="Enter total amount"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleAddDonation}>
                Add
              </Button>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AdminLayout>
  );
};

export default Dashboard;