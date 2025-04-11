import React, { useEffect, useState } from "react";
import AdminLayout from "../components/layout";
import {
  Box,
  Grid,
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
  Icon,
  Flex,
} from "@chakra-ui/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { FaDollarSign, FaHandHoldingHeart } from "react-icons/fa";

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
  location: string;
}

const Dashboard: React.FC = () => {
  const [totalDonations, setTotalDonations] = useState(0);
  const [totalDonors, setTotalDonors] = useState(0);
  const [amountDonatedBack, setAmountDonatedBack] = useState(0);
  const [topDonors, setTopDonors] = useState<TopDonor[]>([]);
  const [donatedBackData, setDonatedBackData] = useState<DonatedBack[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchAmountDonatedBack = async () => {
    const snapshot = await getDocs(collection(db, "donationDetails"));
    const donationDetails = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as {
        organizationName?: string;
        count?: number;
        items?: string;
        typeOfItems?: string;
        total?: number;
        location?: string;
      }),
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
        location: detail.location || "N/A",
      }))
    );
  };

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
      .slice(0, 5);
    setTopDonors(sortedDonations);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTotalDonations(), fetchAmountDonatedBack(), fetchTopDonors()]);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <AdminLayout>
      <Box p={[4, 6]} bg="gray.100">
        <Heading as="h1" size="xl" mb={6} color="blue.600" fontWeight="bold" textAlign={["center", "left"]}>
          Dashboard
        </Heading>

        {loading ? (
          <Flex justify="center" align="center" minH="200px">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <>
            {/* Stats Cards */}
            <Grid templateColumns={["1fr", null, "repeat(3, 1fr)"]} gap={4} mb={6}>
              <Card bg="teal.400" color="white">
                <CardHeader>
                  <Heading size="md">Total Donations</Heading>
                </CardHeader>
                <CardBody>
                  <Flex align="center">
                    <Icon as={FaDollarSign} boxSize={6} mr={2} />
                    <Text fontSize="xl" fontWeight="bold">
                      MMK {totalDonations.toLocaleString()}
                    </Text>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg="orange.400" color="white">
                <CardHeader>
                  <Heading size="md">Total Donors</Heading>
                </CardHeader>
                <CardBody>
                  <Flex align="center">
                    <Icon as={FaDollarSign} boxSize={6} mr={2} />
                    <Text fontSize="xl" fontWeight="bold">
                      {totalDonors.toLocaleString()}
                    </Text>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg="yellow.400" color="white">
                <CardHeader>
                  <Heading size="md">Amount Donated Back</Heading>
                </CardHeader>
                <CardBody>
                  <Flex align="center">
                    <Icon as={FaHandHoldingHeart} boxSize={6} mr={2} />
                    <Text fontSize="xl" fontWeight="bold">
                      MMK {amountDonatedBack.toLocaleString()}
                    </Text>
                  </Flex>
                </CardBody>
              </Card>
            </Grid>

            {/* Data Tables */}
            <Grid templateColumns={["1fr", null, "repeat(2, 1fr)"]} gap={4}>
              {/* Top Donors */}
              <Card bg="blue.500">
                <CardHeader>
                  <Heading size="md" color="white">
                    Top Donors
                  </Heading>
                </CardHeader>
                <CardBody bg="white" roundedBottom="md" overflowX="auto">
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topDonors.map((donor) => (
                        <Tr key={donor.id}>
                          <Td color="blue.600" fontWeight="semibold">
                            {donor.name}
                          </Td>
                          <Td>
                            <Badge colorScheme="teal">{donor.amount.toLocaleString()} MMK</Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>

              {/* Donated Back Table */}
              <Card bg="purple.500">
                <CardHeader>
                  <Heading size="md" color="white">
                    Donated Back Details
                  </Heading>
                </CardHeader>
                <CardBody bg="white" roundedBottom="md" overflowX="auto">
                  {donatedBackData.length > 0 ? (
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Org</Th>
                          <Th>Count</Th>
                          <Th>Items</Th>
                          <Th>Type</Th>
                          <Th>Total</Th>
                          <Th>Location</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {donatedBackData.map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.organizationName}</Td>
                            <Td>{item.count}</Td>
                            <Td>{item.items}</Td>
                            <Td>{item.typeOfItems}</Td>
                            <Td>{item.total.toLocaleString()}</Td>
                            <Td>{item.location}</Td>
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
            </Grid>
          </>
        )}
      </Box>
    </AdminLayout>
  );
};

export default Dashboard;
