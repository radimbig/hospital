import React, { useEffect, useState } from 'react';
import {
  Text, Paper, Loader, Alert, Modal, Button, Group, Stack, TextInput, Box, Title, SegmentedControl
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates'; // For selecting date and time
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; // Required for DateTimePicker styles
import useAuthStore from '../../store/authStore';
import AppointmentsService from '../../services/AppointmentsService'; 
import {
  IconAlertCircle, IconCalendarEvent, IconClock, IconUser, IconPlus, IconTrash, IconId
} from '@tabler/icons-react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { notifications } from '@mantine/notifications'; // Import notifications
import axios from 'axios'; // Import axios for error handling

// Renamed function to DoctorAppointmentsPage
function DoctorAppointmentsPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModal }] = useDisclosure(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [isDeletingAppointment, setIsDeletingAppointment] = useState(false); // State for delete loading

  // State for the creation modal and form
  const [createModalOpened, { open: openCreateModal, close: closeCreateModalOriginal }] = useDisclosure(false);
  const [identificationType, setIdentificationType] = useState('login'); // 'login' or 'pesel'
  const [patientLogin, setPatientLogin] = useState('');
  const [patientPesel, setPatientPesel] = useState(''); // New state for PESEL
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [createAppointmentError, setCreateAppointmentError] = useState(null);

  const fetchAndFormatAppointments = async (showLoadingIndicator = true) => {
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      if (showLoadingIndicator) setLoading(false);
      return;
    }
    if (showLoadingIndicator) setLoading(true);
    setError(null);
    try {
      const rawAppointments = await AppointmentsService.getMyAppointments(token, 100); // Fetch more for doctor
      console.log('Doctor - Fetched Raw Appointments:', rawAppointments);

      if (Array.isArray(rawAppointments)) {
        const formattedEvents = rawAppointments.map(appt => ({
          id: appt.id,
          title: `Patient: ${appt.patient?.name || 'N/A'} ${appt.patient?.surname || 'N/A'} (Dr. ${appt.doctor?.surname || 'N/A'})`,
          start: appt.slot?.start,
          end: appt.slot?.end,
          extendedProps: { doctor: appt.doctor, patient: appt.patient, appointmentId: appt.id }
        }));
        setEvents(formattedEvents);
        console.log('Doctor - Formatted Events for Calendar:', formattedEvents);
      } else {
        console.warn('Doctor - Received non-array data for appointments:', rawAppointments);
        setEvents([]);
      }
      if (showLoadingIndicator) setLoading(false);
    } catch (err) {
      console.error("DoctorAppointmentsPage: Error fetching or formatting appointments:", err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch appointments.';
      setError(errorMsg);
      setEvents([]);
      if (showLoadingIndicator) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndFormatAppointments();
  }, [token]);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEventDetails({
      id: event.id,
      title: event.title,
      start: event.start ? event.start.toLocaleString() : 'N/A',
      end: event.end ? event.end.toLocaleString() : 'N/A',
      doctor: event.extendedProps.doctor,
      patient: event.extendedProps.patient,
      appointmentId: event.extendedProps.appointmentId
    });
    openDetailsModal();
  };

  const resetCreateModalForm = () => {
    setPatientLogin('');
    setPatientPesel('');
    setStartTime(null);
    setEndTime(null);
    setIdentificationType('login');
    setCreateAppointmentError(null);
  };

  const openCreateModalWithReset = () => {
    resetCreateModalForm();
    openCreateModal();
  };

  const closeCreateModalAndReset = () => {
    closeCreateModalOriginal();
    setCreateAppointmentError(null); // Only clear error on close, keep other fields if user wants to re-open
  };

  const handlePatientPeselChange = (event) => {
    const value = event.currentTarget.value;
    // Allow only digits and limit to 11 characters
    if (/^\d*$/.test(value) && value.length <= 11) {
      setPatientPesel(value);
      if (createAppointmentError && (createAppointmentError.includes('PESEL') || createAppointmentError.includes('11 digits'))) {
        setCreateAppointmentError(null); // Clear PESEL specific errors on input
      }
    }
  };

  const handleCreateAppointment = async () => {
    setCreateAppointmentError(null); // Clear previous errors
    let isValid = true;
    let currentError = null;

    // Validate Identifier
    if (identificationType === 'login') {
      if (!patientLogin.trim()) {
        currentError = 'Patient Login is required.';
        isValid = false;
      }
    } else if (identificationType === 'pesel') {
      if (!patientPesel.trim()) {
        currentError = 'Patient PESEL is required.';
        isValid = false;
      } else if (!/^\d{11}$/.test(patientPesel)) {
        currentError = 'Patient PESEL must be exactly 11 digits and numeric.';
        isValid = false;
      }
    }

    // Validate Start Time
    if (!startTime) {
      currentError = currentError ? `${currentError} Start Time is required.` : 'Start Time is required.';
      isValid = false;
    } else {
      const now = new Date();
      const startDate = new Date(String(startTime).replace(' ', 'T'));
      if (startDate < now) {
        currentError = currentError ? `${currentError} Start Time cannot be in the past.` : 'Start Time cannot be in the past.';
        isValid = false;
      }
    }

    // Validate End Time
    if (!endTime) {
      currentError = currentError ? `${currentError} End Time is required.` : 'End Time is required.';
      isValid = false;
    } else if (startTime && endTime) { // Only check if both are present
        const startDate = new Date(String(startTime).replace(' ', 'T'));
        const endDate = new Date(String(endTime).replace(' ', 'T'));
      if (endDate <= startDate) {
        currentError = currentError ? `${currentError} End Time must be after Start Time.` : 'End Time must be after Start Time.';
        isValid = false;
      }
    }
    
    if (!isValid) {
      setCreateAppointmentError(currentError);
      return;
    }

    setIsCreatingAppointment(true);

    const appointmentPayloadBase = {
      slot: {
        start: typeof startTime === 'string' ? startTime.replace(' ', 'T') : startTime.toISOString().replace(/\.\d+Z$/, ''),
        end: typeof endTime === 'string' ? endTime.replace(' ', 'T') : endTime.toISOString().replace(/\.\d+Z$/, ''),
      }
    };

    const finalPayload = identificationType === 'login'
      ? { ...appointmentPayloadBase, patientLogin: patientLogin }
      : { ...appointmentPayloadBase, patientPesel: patientPesel };

    try {
      await AppointmentsService.createAppointment(finalPayload, token);
      notifications.show({
        title: 'Appointment Created',
        message: `Successfully created appointment. Calendar will refresh.`,
        color: 'green',
      });
      closeCreateModalOriginal(); // Close modal
      resetCreateModalForm(); // Reset form completely
      await fetchAndFormatAppointments(false);
    } catch (err) {
      console.error("DoctorAppointmentsPage: Error creating appointment:", err);
      let errMsg = 'Failed to create appointment. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.data) {
           errMsg = typeof err.response.data === 'object' && err.response.data !== null 
                      ? err.response.data.message || JSON.stringify(err.response.data) 
                      : String(err.response.data);
        } else if (err.response.status === 404) {
          errMsg = 'Patient not found with the provided identifier or other resource missing.';
        } else {
          errMsg = `Request failed with status code ${err.response.status}`;
        }
      } else if (err.message) {
        errMsg = err.message;
      }
      setCreateAppointmentError(errMsg);
      notifications.show({ title: 'Creation Error', message: errMsg, color: 'red' });
    }
    setIsCreatingAppointment(false);
  };

  const handleDeleteAppointment = async () => {
    if (!selectedEventDetails || !selectedEventDetails.appointmentId) {
      notifications.show({
        title: 'Error',
        message: 'No appointment selected or appointment ID is missing.',
        color: 'red',
      });
      return;
    }
    setIsDeletingAppointment(true);
    try {
      await AppointmentsService.deleteAppointment(selectedEventDetails.appointmentId, token);
      notifications.show({
        title: 'Appointment Deleted',
        message: 'The appointment has been successfully deleted. Calendar will refresh.',
        color: 'green',
      });
      closeDetailsModal();
      await fetchAndFormatAppointments(false); // Re-fetch to update calendar
    } catch (err) {
      console.error("DoctorAppointmentsPage: Error deleting appointment:", err);
      const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to delete appointment.';
      notifications.show({ title: 'Deletion Error', message: errMsg, color: 'red' });
    }
    setIsDeletingAppointment(false);
  };

  if (loading && events.length === 0) { // Only show main loader on initial load or if explicitly true
    return (
      <Box style={{ textAlign: 'center', paddingTop: '20px' }}>
        <Loader />
        <Text mt="md">Loading appointments...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" my="lg">
        {error}
      </Alert>
    );
  }

  return (
    <Paper p="md" shadow="xs" radius="md">
      <Group justify="space-between" mb="md">
        <Title order={3}>Appointments Calendar</Title>
        <Button leftSection={<IconPlus size={18} />} onClick={openCreateModalWithReset}>
          Create Appointment
        </Button>
      </Group>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        events={events}
        editable={false} 
        selectable={false}
        selectMirror={true}
        dayMaxEvents={true}
        eventClick={handleEventClick}
      />

      {/* Details Modal (existing) */}
      {selectedEventDetails && (
        <Modal
          opened={detailsModalOpened}
          onClose={closeDetailsModal}
          title={<Text fw={700}><IconCalendarEvent size={20} style={{ marginRight: '8px' }} />Appointment Details</Text>}
          centered
          size="md"
        >
          <Stack gap="sm">
            <Text><Text fw={500} component="span">Details: </Text>{selectedEventDetails.title}</Text>
            <Text><IconClock size={16} style={{ marginRight: '8px' }} /><Text fw={500} component="span">Start: </Text>{selectedEventDetails.start}</Text>
            <Text><IconClock size={16} style={{ marginRight: '8px' }} /><Text fw={500} component="span">End: </Text>{selectedEventDetails.end}</Text>
            {selectedEventDetails.patient && (
              <Paper withBorder p="xs" mt="xs" radius="sm">
                <Text fw={500} mb="xs"><IconUser size={16} style={{ marginRight: '8px' }}/>Patient Information:</Text>
                <Text ml="md">Name: {selectedEventDetails.patient.name} {selectedEventDetails.patient.surname}</Text>
                <Text ml="md">ID: {selectedEventDetails.patient.id}</Text>
              </Paper>
            )}
            {selectedEventDetails.doctor && (
              <Paper withBorder p="xs" mt="xs" radius="sm">
                <Text fz="xs" c="dimmed">Doctor Assigned:</Text>
                <Text ml="md" fz="sm">{selectedEventDetails.doctor.name} {selectedEventDetails.doctor.surname} (ID: {selectedEventDetails.doctor.id})</Text>
              </Paper>
            )}
          </Stack>
          <Group justify="space-between" mt="lg">
            <Button 
              color="red" 
              onClick={handleDeleteAppointment} 
              loading={isDeletingAppointment}
              leftSection={<IconTrash size={16}/>}
            >
              Delete
            </Button>
            <Button onClick={closeDetailsModal} variant="light">Close</Button>
          </Group>
        </Modal>
      )}

      {/* Create Appointment Modal (new) */}
      <Modal
        opened={createModalOpened}
        onClose={closeCreateModalAndReset}
        title={<Text fw={700}><IconPlus size={20} style={{ marginRight: '8px' }}/>Create New Appointment</Text>}
        centered
        size="lg" // Made slightly larger for the form
      >
        <Stack gap="md">
          <SegmentedControl
            value={identificationType}
            onChange={(value) => {
              setIdentificationType(value);
              setCreateAppointmentError(null); // Clear errors when switching type
              // Do not clear patientLogin/patientPesel here, user might switch back and forth
            }}
            data={[
              { label: 'Identify by Login', value: 'login' },
              { label: 'Identify by PESEL', value: 'pesel' },
            ]}
            fullWidth
            mb="sm"
          />

          {identificationType === 'login' ? (
            <TextInput
              required
              label="Patient Login"
              placeholder="Enter patient's login/username"
              value={patientLogin}
              onChange={(event) => {
                setPatientLogin(event.currentTarget.value);
                if (createAppointmentError && createAppointmentError.includes('Login')) setCreateAppointmentError(null);
              }}
              error={createAppointmentError && (createAppointmentError.includes('Login') || (createAppointmentError.includes('identifier') && identificationType === 'login')) ? createAppointmentError.split(' ')[0] + ' ' + createAppointmentError.split(' ')[1] + ' is required.' : null}
            />
          ) : (
            <TextInput
              required
              label="Patient PESEL"
              placeholder="Enter 11-digit PESEL"
              value={patientPesel}
              onChange={handlePatientPeselChange}
              error={createAppointmentError && (createAppointmentError.includes('PESEL') || (createAppointmentError.includes('identifier') && identificationType === 'pesel') || createAppointmentError.includes('11 digits')) ? createAppointmentError : null}
              maxLength={11}
            />
          )}

          <DateTimePicker
            required
            label="Start Time"
            placeholder="Pick date and time for start"
            value={startTime}
            onChange={(value) => {
                setStartTime(value);
                if (createAppointmentError && createAppointmentError.includes('Start Time')) setCreateAppointmentError(null);
            }}
            error={createAppointmentError && createAppointmentError.includes('Start Time') ? 'Start Time is required/invalid.' : null}
            valueFormat="YYYY-MM-DD HH:mm:ss"
            minDate={new Date()} // Prevents selecting past dates/times
          />
          <DateTimePicker
            required
            label="End Time"
            placeholder="Pick date and time for end"
            value={endTime}
            onChange={(value) => {
                setEndTime(value);
                if (createAppointmentError && createAppointmentError.includes('End Time')) setCreateAppointmentError(null);
            }}
            error={createAppointmentError && createAppointmentError.includes('End Time') ? 'End Time is required/invalid.' : null}
            valueFormat="YYYY-MM-DD HH:mm:ss"
            minDate={startTime ? new Date(new Date(String(startTime).replace(' ', 'T')).getTime() + 60000) : new Date()} // End time must be at least 1 min after start
          />

          {createAppointmentError && (
            <Alert title="Error" color="red" icon={<IconAlertCircle />} withCloseButton onClose={() => setCreateAppointmentError(null)}>
              {createAppointmentError}
            </Alert>
          )}

          <Group justify="flex-end" mt="lg">
            <Button onClick={closeCreateModalAndReset} variant="default">Cancel</Button>
            <Button 
              onClick={handleCreateAppointment} 
              loading={isCreatingAppointment}
              leftSection={<IconPlus size={16}/>}
            >
              Create Appointment
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

export default DoctorAppointmentsPage; // Renamed export 