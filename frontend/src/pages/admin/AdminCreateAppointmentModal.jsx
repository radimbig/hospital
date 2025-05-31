import React, { useState } from 'react';
import {
  Modal, Button, Stack, TextInput, SegmentedControl, Text, Alert, Group
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import AppointmentsService from '../../services/AppointmentsService';
import DoctorsService from '../../services/DoctorsService';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconAlertCircle } from '@tabler/icons-react';
import axios from 'axios';

function AdminCreateAppointmentModal({ opened, onClose, doctorLogin, doctorName, token, onAppointmentCreated }) {
  const [identificationType, setIdentificationType] = useState('login');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const form = useForm({
    initialValues: {
      patientIdentifier: '',
      startTime: null,
      endTime: null,
    },
    validate: (values) => {
      const errors = {};
      if (!values.patientIdentifier.trim()) {
        errors.patientIdentifier = identificationType === 'login' ? 'Patient Login is required' : 'Patient PESEL is required';
      }
      if (identificationType === 'pesel' && values.patientIdentifier.trim() && !/^\d{11}$/.test(values.patientIdentifier)) {
        errors.patientIdentifier = 'PESEL must be 11 digits';
      }
      if (!values.startTime) {
        errors.startTime = 'Start time is required';
      }
      if (!values.endTime) {
        errors.endTime = 'End time is required';
      }
      if (values.startTime && values.endTime && new Date(values.startTime) >= new Date(values.endTime)) {
        errors.endTime = 'End time must be after start time';
      }
      if (values.startTime && new Date(values.startTime) < new Date()) {
        errors.startTime = 'Start time cannot be in the past';
      }
      return errors;
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);
    setFormError(null);

    const payload = {
      doctorLogin: doctorLogin,
      Slot: {
        start: typeof values.startTime === 'string' 
               ? values.startTime.replace(' ', 'T') 
               : values.startTime.toISOString().replace(/\.\d+Z$/, ''),
        end: typeof values.endTime === 'string'
             ? values.endTime.replace(' ', 'T')
             : values.endTime.toISOString().replace(/\.\d+Z$/, ''),
      },
    };

    if (identificationType === 'login') {
      payload.patientLogin = values.patientIdentifier;
    } else {
      payload.patientPesel = values.patientIdentifier;
    }

    try {
      await AppointmentsService.adminCreateAppointment(payload, token);
      notifications.show({
        title: 'Appointment Created',
        message: `Successfully created appointment for Dr. ${doctorName}.`,
        color: 'green',
      });
      DoctorsService.clearDoctorAppointmentsCache(doctorLogin);
      form.reset();
      setIdentificationType('login');
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
      onClose();
    } catch (error) {
      console.error('AdminCreateAppointmentModal: Error creating appointment:', error);
      let errorMessage = 'Failed to create appointment. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        if (typeof error.response.data === 'string' && error.response.data.length < 200 && error.response.data.length > 0) {
          errorMessage = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400){
            errorMessage = "Validation error, slot not available, or patient/doctor not found. Please check details.";
        } else if (error.response.status === 404){
            errorMessage = "Patient or Doctor not found with the provided details.";
        }
      }
      setFormError(errorMessage);
      notifications.show({ title: 'Creation Error', message: errorMessage, color: 'red' });
    }
    setLoading(false);
  };
  
  const handleCloseModal = () => {
    form.reset();
    setIdentificationType('login');
    setFormError(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleCloseModal}
      title={<Text fw={700}><IconPlus size={20} style={{ marginRight: '8px' }} />Create Appointment for Dr. {doctorName}</Text>}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <SegmentedControl
            value={identificationType}
            onChange={(value) => {
              setIdentificationType(value);
              form.setFieldValue('patientIdentifier', '');
              form.clearFieldError('patientIdentifier');
            }}
            data={[
              { label: 'By Patient Login', value: 'login' },
              { label: 'By Patient PESEL', value: 'pesel' },
            ]}
            fullWidth
            mb="sm"
          />
          <TextInput
            required
            label={identificationType === 'login' ? 'Patient Login' : 'Patient PESEL'}
            placeholder={identificationType === 'login' ? 'Enter patient\'s login' : 'Enter 11-digit PESEL'}
            {...form.getInputProps('patientIdentifier')}
            maxLength={identificationType === 'pesel' ? 11 : undefined}
          />
          <DateTimePicker
            required
            label="Start Time"
            placeholder="Pick date and time for start"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            minDate={new Date()}
            {...form.getInputProps('startTime')}
          />
          <DateTimePicker
            required
            label="End Time"
            placeholder="Pick date and time for end"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            minDate={form.values.startTime && form.values.startTime instanceof Date ? new Date(form.values.startTime.getTime() + 60000) : new Date(new Date().getTime() + 60000)}
            {...form.getInputProps('endTime')}
          />

          {formError && (
            <Alert title="Form Error" color="red" icon={<IconAlertCircle />} withCloseButton onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}

          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" loading={loading} leftSection={<IconPlus size={16} />}>
              Create Appointment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default AdminCreateAppointmentModal; 