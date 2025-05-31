import React, { useEffect, useState, useCallback } from 'react';
import { Modal, Loader, Alert, Text, Paper, Box, Group, Stack, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; // If DateTimePicker or other date components are used
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // Not strictly needed if not interactive
import DoctorsService from '../../services/DoctorsService'; // To get the doctor's appointments
import { notifications } from '@mantine/notifications'; // Import notifications
import { IconAlertCircle, IconCalendarEvent, IconClock, IconUser, IconTrash, IconPlus } from '@tabler/icons-react';
import AdminCreateAppointmentModal from './AdminCreateAppointmentModal'; // Import the new modal

function DoctorAppointmentsModal({ opened, onClose, doctorLogin, doctorName, token }) {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // To force re-fetch/re-render of calendar

  const [detailsModalOpened, { open: openDetailsModal, close: closeDetailsModalOriginal }] = useDisclosure(false);
  const [selectedEventDetailsForAdminView, setSelectedEventDetailsForAdminView] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete button

  // For create appointment modal
  const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);

  // Memoized function to fetch appointments and format them
  const fetchAndFormatAppointments = useCallback(async () => {
    if (!opened || !doctorLogin || !token) return;
    setLoading(true);
    setError(null);
    try {
      await DoctorsService.attachAppointmentsToDoctor(doctorLogin, token, 100);
      const allDoctors = await DoctorsService.getDoctors(token); // Will be from cache
      const currentDoctor = allDoctors.find(doc => doc.login === doctorLogin);

      if (currentDoctor && currentDoctor.appointments) {
        const formatted = currentDoctor.appointments.map(appt => ({
          id: appt.id,
          title: `Patient: ${appt.patient?.name || 'N/A'} ${appt.patient?.surname || 'N/A'}`,
          start: appt.slot?.start,
          end: appt.slot?.end,
          extendedProps: {
            appointmentId: appt.id,
            patient: appt.patient,
            doctor: { name: currentDoctor.name, surname: currentDoctor.surname, login: currentDoctor.login },
            slot: appt.slot
          }
        }));
        setCalendarEvents(formatted);
      } else if (currentDoctor && Array.isArray(currentDoctor.appointments) && currentDoctor.appointments.length === 0) {
        setCalendarEvents([]); // Explicitly set to empty if API returns empty array
      } else if (!currentDoctor) {
        setError(`Doctor with login ${doctorLogin} not found.`);
      } else {
        setError(`Could not retrieve appointment data for ${doctorName}. The appointments property might be missing or not an array.`);
        setCalendarEvents([]);
      }
    } catch (err) {
      console.error(`DoctorAppointmentsModal: Error processing appointments for ${doctorLogin}:`, err);
      setError(err.message || 'Failed to load appointments.');
      setCalendarEvents([]);
    }
    setLoading(false);
  }, [opened, doctorLogin, token, doctorName]); // Dependencies for useCallback

  useEffect(() => {
    fetchAndFormatAppointments();
  }, [fetchAndFormatAppointments, refreshTrigger]); // Re-run if function or trigger changes

  const handleEventClickAdminView = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEventDetailsForAdminView({
      id: event.id,
      title: event.title,
      start: event.start ? event.start.toLocaleString() : 'N/A',
      end: event.end ? event.end.toLocaleString() : 'N/A',
      patient: event.extendedProps.patient,
      doctor: event.extendedProps.doctor,
      appointmentId: event.extendedProps.appointmentId,
    });
    openDetailsModal();
  };

  const closeDetailsModal = () => {
    closeDetailsModalOriginal();
    setSelectedEventDetailsForAdminView(null); // Clear selection on close
  };
  
  const handleDeleteAppointmentAdmin = async () => {
    if (!selectedEventDetailsForAdminView || !selectedEventDetailsForAdminView.appointmentId) {
      notifications.show({
        title: 'Error',
        message: 'No appointment selected or ID is missing.',
        color: 'red',
      });
      return;
    }
    setIsDeleting(true);
    try {
      await DoctorsService.deleteAppointmentAndUpdateDoctorCache(
        selectedEventDetailsForAdminView.appointmentId,
        doctorLogin, // The login of the doctor whose calendar we are viewing
        token
      );
      notifications.show({
        title: 'Appointment Deleted',
        message: 'The appointment has been successfully deleted.',
        color: 'green',
      });
      closeDetailsModal(); // Close the details modal
      setRefreshTrigger(prev => prev + 1); // Trigger re-fetch/re-render of the main calendar
    } catch (err) {
      console.error('DoctorAppointmentsModal: Error deleting appointment:', err);
      notifications.show({
        title: 'Deletion Error',
        message: err.message || 'Failed to delete the appointment.',
        color: 'red',
      });
    }
    setIsDeleting(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}><IconCalendarEvent size={20} style={{ marginRight: '8px' }} />Appointments for Dr. {doctorName} ({doctorLogin})</Text>}
      size="90%" // Large modal size
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Group justify="flex-end" mb="md">
        <Button leftSection={<IconPlus size={16} />} onClick={openCreateModal}>
          Create New Appointment for Dr. {doctorName}
        </Button>
      </Group>

      {loading && (
        <Box style={{ textAlign: 'center', padding: '20px' }}>
          <Loader />
          <Text mt="md">Loading appointments...</Text>
        </Box>
      )}
      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" my="lg">
          {error}
        </Alert>
      )}
      {!loading && !error && calendarEvents.length === 0 && (
        <Paper p="xl" shadow="xs" style={{ textAlign: 'center' }}>
            <Text>No appointments scheduled for Dr. {doctorName}.</Text>
        </Paper>
      )}
      {!loading && !error && calendarEvents.length > 0 && (
        <Paper p="md" shadow="xs" radius="md" mt="md">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            editable={false}      // Admin probably shouldn't edit directly here
            selectable={false}    // Nor select empty slots
            dayMaxEvents={true}
            eventClick={handleEventClickAdminView}
            height="auto" // Adjust height to fit content or set a fixed one like "65vh"
            aspectRatio={1.8} // Adjusted for potentially better view in modal
          />
        </Paper>
      )}

      {selectedEventDetailsForAdminView && (
        <Modal
          opened={detailsModalOpened}
          onClose={closeDetailsModal}
          title={<Text fw={700}><IconCalendarEvent size={20} style={{ marginRight: '8px' }}/>Appointment Details</Text>}
          centered
          size="lg" // Slightly smaller than the main modal, but still large enough
          zIndex={1001} // Ensure it's above the main modal
          overlayProps={{
            backgroundOpacity: 0.25, // Less opacity for nested modal overlay
            blur: 1,
          }}
        >
          <Stack gap="sm">
            <Text><Text fw={500} component="span">Details: </Text>{selectedEventDetailsForAdminView.title}</Text>
            <Text><IconClock size={16} style={{ marginRight: '8px' }} /><Text fw={500} component="span">Start: </Text>{selectedEventDetailsForAdminView.start}</Text>
            <Text><IconClock size={16} style={{ marginRight: '8px' }} /><Text fw={500} component="span">End: </Text>{selectedEventDetailsForAdminView.end}</Text>
            
            {selectedEventDetailsForAdminView.patient && (
              <Paper withBorder p="xs" mt="xs" radius="sm">
                <Text fw={500} mb="xs"><IconUser size={16} style={{ marginRight: '8px' }}/>Patient Information:</Text>
                <Text ml="md">Name: {selectedEventDetailsForAdminView.patient.name} {selectedEventDetailsForAdminView.patient.surname}</Text>
                <Text ml="md">ID: {selectedEventDetailsForAdminView.patient.id || 'N/A'}</Text>
              </Paper>
            )}
            
            {selectedEventDetailsForAdminView.doctor && (
              <Paper withBorder p="xs" mt="xs" radius="sm">
                <Text fz="sm" c="dimmed">Doctor for this calendar:</Text>
                <Text ml="md" fz="sm">
                  Dr. {selectedEventDetailsForAdminView.doctor.name} {selectedEventDetailsForAdminView.doctor.surname} (Login: {selectedEventDetailsForAdminView.doctor.login})
                </Text>
              </Paper>
            )}
          </Stack>
          <Group justify="space-between" mt="xl">
            <Button 
              color="red" 
              leftSection={<IconTrash size={16}/>}
              onClick={handleDeleteAppointmentAdmin}
              loading={isDeleting}
            >
              Delete
            </Button>
            <Button onClick={closeDetailsModal} variant="light">Close</Button>
          </Group>
        </Modal>
      )}

      {/* Create Appointment Modal for Admin */}
      {opened && doctorLogin && (
         <AdminCreateAppointmentModal
            opened={createModalOpened}
            onClose={closeCreateModal}
            doctorLogin={doctorLogin}
            doctorName={doctorName}
            token={token}
            onAppointmentCreated={() => {
                setRefreshTrigger(prev => prev + 1); // Refresh the main calendar
            }}
        />
      )}
    </Modal>
  );
}

export default DoctorAppointmentsModal; 