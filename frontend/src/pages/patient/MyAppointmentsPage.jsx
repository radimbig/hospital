import React, { useEffect, useState } from 'react';
import { Text, Paper, Loader, Alert, Modal, Button, Group, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import useAuthStore from '../../store/authStore';
import AppointmentsService from '../../services/AppointmentsService';
import { IconAlertCircle, IconCalendarEvent, IconClock, IconUser } from '@tabler/icons-react';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function MyAppointmentsPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

  useEffect(() => {
    const fetchAndFormatAppointments = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rawAppointments = await AppointmentsService.getMyAppointments(token, 30);
        console.log('Fetched Raw Appointments:', rawAppointments);

        if (Array.isArray(rawAppointments)) {
          const formattedEvents = rawAppointments.map(appt => ({
            id: appt.id,
            title: `Dr. ${appt.doctor?.surname || 'N/A'} - Patient: ${appt.patient?.name || 'N/A'} ${appt.patient?.surname || 'N/A'}`,
            start: appt.slot?.start,
            end: appt.slot?.end,
            extendedProps: {
              doctor: appt.doctor,
              patient: appt.patient,
            }
          }));
          setEvents(formattedEvents);
          console.log('Formatted Events for Calendar:', formattedEvents);
        } else {
          console.warn('Received non-array data for appointments:', rawAppointments);
          setEvents([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("MyAppointmentsPage: Error fetching or formatting appointments:", err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch appointments.';
        setError(errorMsg);
        setEvents([]);
        setLoading(false);
      }
    };

    fetchAndFormatAppointments();
  }, [token]);

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    setSelectedEventDetails({
      title: event.title,
      start: event.start ? event.start.toLocaleString() : 'N/A',
      end: event.end ? event.end.toLocaleString() : 'N/A',
      doctor: event.extendedProps.doctor,
      patient: event.extendedProps.patient,
    });
    openModal();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '20px' }}>
        <Loader />
        <Text mt="md">Loading appointments...</Text>
      </div>
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

      {selectedEventDetails && (
        <Modal
          opened={modalOpened}
          onClose={closeModal}
          title={<Text fw={700}><IconCalendarEvent size={20} style={{ marginRight: '8px' }} />Appointment Details</Text>}
          centered
          size="md"
        >
          <Stack gap="sm">
            <Text><Text fw={500} component="span">Subject: </Text>{selectedEventDetails.title}</Text>
            <Text><IconClock size={16} style={{ marginRight: '8px' }} /><Text fw={500} component="span">Start: </Text>{selectedEventDetails.start}</Text>
            <Text><IconClock size={16} style={{ marginRight: '8px' }} /><Text fw={500} component="span">End: </Text>{selectedEventDetails.end}</Text>
            
            {selectedEventDetails.doctor && (
              <Paper withBorder p="xs" mt="xs" radius="sm">
                <Text fw={500} mb="xs"><IconUser size={16} style={{ marginRight: '8px' }}/>Doctor Information:</Text>
                <Text ml="md">Name: {selectedEventDetails.doctor.name} {selectedEventDetails.doctor.surname}</Text>
                <Text ml="md">ID: {selectedEventDetails.doctor.id}</Text>
              </Paper>
            )}
          </Stack>
          <Group justify="flex-end" mt="lg">
            <Button onClick={closeModal} variant="light">Close</Button>
          </Group>
        </Modal>
      )}
    </Paper>
  );
}

export default MyAppointmentsPage; 