import React, { useEffect, useState } from 'react';
import {
  Container, Title, Text, Paper, Loader, Alert, TextInput, SimpleGrid, Card, Group, Badge, UnstyledButton, Button
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconCalendarEvent, IconUserPlus } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import DoctorsService from '../../services/DoctorsService';
import useAuthStore from '../../store/authStore';
import DoctorAppointmentsModal from './DoctorAppointmentsModal';
import RegisterDoctorModal from './RegisterDoctorModal';

function AdminManagementPage() {
  const { token } = useAuthStore();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [modalOpened, { open: openAppointmentsModal, close: closeAppointmentsModal }] = useDisclosure(false);
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState(null);

  const [registerModalOpened, { open: openRegisterModal, close: closeRegisterModal }] = useDisclosure(false);

  const fetchDoctorsList = async (showMainLoader = false) => {
    if (!token) {
      setError('Authentication token not found.');
      if (showMainLoader) setLoading(false);
      return;
    }
    if (showMainLoader) setLoading(true);
    setError(null);
    try {
      const fetchedDoctors = await DoctorsService.getDoctors(token);
      setDoctors(fetchedDoctors);
      setFilteredDoctors(fetchedDoctors);
    } catch (err) {
      console.error('AdminManagementPage: Error fetching doctors:', err);
      setError(err.message || 'Failed to fetch doctors. Please try again.');
    }
    if (showMainLoader) setLoading(false);
  };

  useEffect(() => {
    fetchDoctorsList(true); // Pass true for initial load to show main loader
  }, [token]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredDoctors(doctors);
      return;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = doctors.filter(doctor => 
      doctor.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      doctor.surname.toLowerCase().includes(lowerCaseSearchTerm) ||
      doctor.login.toLowerCase().includes(lowerCaseSearchTerm) ||
      (doctor.pesel && doctor.pesel.includes(searchTerm)) // Ensure doctor.pesel exists
    );
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const handleDoctorCardClick = (doctor) => {
    setSelectedDoctorForModal(doctor);
    openAppointmentsModal();
  };

  if (loading && doctors.length === 0) { // Only show full page loader on initial load
    return (
      <Container style={{ textAlign: 'center', paddingTop: '20px' }}>
        <Loader />
        <Text mt="md">Loading doctors...</Text>
      </Container>
    );
  }

  if (error && doctors.length === 0) { // Show critical error if doctors list is empty
    return (
      <Container>
        <Alert title="Error fetching doctors" color="red" mt="md">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Group justify="space-between" align="center" mb="lg">
        <Title order={2}>Doctors Management</Title>
        <Button 
          leftSection={<IconUserPlus size={18} />}
          onClick={openRegisterModal}
        >
          Register New Doctor
        </Button>
      </Group>
      
      <TextInput
        placeholder="Search by name, surname, login, or PESEL..."
        mb="xl"
        leftSection={<IconSearch size={16} />}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
      />

      {error && doctors.length > 0 && (
         <Alert title="Update Error" color="orange" mt="md" mb="md" withCloseButton onClose={() => setError(null)}>
           {error} {/* Show non-critical errors here, e.g., refresh failed but old data shown */}
         </Alert>
      )}

      {filteredDoctors.length === 0 && !loading && (
        <Paper p="xl" shadow="xs" style={{ textAlign: 'center' }}>
          <Text>No doctors found matching your criteria, or no doctors available.</Text>
        </Paper>
      )}

      <SimpleGrid 
        cols={{ base: 1, sm: 2, md: 3, lg: 4 }} 
        spacing="lg"
        verticalSpacing="lg"
      >
        {filteredDoctors.map((doctor) => (
          <UnstyledButton key={doctor.id || doctor.personId} onClick={() => handleDoctorCardClick(doctor)} style={{ width: '100%' }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder style={{ height: '100%' }}>
              <Group justify="space-between" mt="xs" mb="xs">
                <Title order={4}>{doctor.name} {doctor.surname}</Title>
                <Badge color="blue" variant="light">
                  Doctor
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">Login: {doctor.login}</Text>
              <Text size="sm" c="dimmed" mt={5}>PESEL: {doctor.pesel || 'N/A'}</Text> {/* Handle null pesel */}
              <Group justify="flex-end" mt="md">
                  <IconCalendarEvent size={18} style={{color: '#228be6'}}/> 
                  <Text size="xs" c="blue">View Appointments</Text>
              </Group>
            </Card>
          </UnstyledButton>
        ))}
      </SimpleGrid>

      {selectedDoctorForModal && (
        <DoctorAppointmentsModal
          opened={modalOpened}
          onClose={() => {
            closeAppointmentsModal();
            setSelectedDoctorForModal(null);
          }}
          doctorLogin={selectedDoctorForModal.login}
          doctorName={`${selectedDoctorForModal.name} ${selectedDoctorForModal.surname}`}
          token={token}
        />
      )}

      <RegisterDoctorModal
        opened={registerModalOpened}
        onClose={closeRegisterModal}
        token={token}
        onDoctorRegistered={() => {
          fetchDoctorsList(false); // Pass false, don't show full page loader for refresh
        }}
      />
    </Container>
  );
}

export default AdminManagementPage; 