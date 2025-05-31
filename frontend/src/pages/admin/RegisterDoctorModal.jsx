import React, { useState } from 'react';
import { Modal, TextInput, Button, Stack, Text, Alert, Group, LoadingOverlay } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconUserPlus, IconAlertCircle } from '@tabler/icons-react';
import DoctorsService from '../../services/DoctorsService';

function RegisterDoctorModal({ opened, onClose, token, onDoctorRegistered }) {
  const [personLogin, setPersonLogin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);

  const handleOpenConfirmModal = () => {
    if (!personLogin.trim()) {
      setError('Person Login is required.');
      return;
    }
    setError(null); // Clear previous error
    setConfirmModalOpened(true);
  };

  const handleRegisterDoctor = async () => {
    setConfirmModalOpened(false); // Close confirmation modal first
    setIsLoading(true);
    setError(null);

    try {
      await DoctorsService.registerDoctor(personLogin, token);
      notifications.show({
        title: 'Doctor Registered',
        message: `User '${personLogin}' has been successfully registered as a doctor.`,
        color: 'green',
      });
      setPersonLogin(''); // Reset input
      if (onDoctorRegistered) {
        onDoctorRegistered(); // Callback to refresh list in parent
      }
      onClose(); // Close the main registration modal
    } catch (err) {
      console.error("RegisterDoctorModal: Error registering doctor:", err);
      const errorMessage = err.message || 'An unexpected error occurred during registration.';
      setError(errorMessage);
      notifications.show({
        title: 'Registration Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMainModalClose = () => {
    setPersonLogin('');
    setError(null);
    setIsLoading(false);
    setConfirmModalOpened(false);
    onClose();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleMainModalClose}
        title={<Text fw={700}><IconUserPlus size={20} style={{ marginRight: '8px' }} />Register New Doctor</Text>}
        centered
      >
        <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />
        <Stack gap="md">
          <TextInput
            required
            label="Person Login"
            placeholder="Enter the login of the user to register as a doctor"
            value={personLogin}
            onChange={(event) => {
              setPersonLogin(event.currentTarget.value);
              if (error) setError(null); // Clear error on input change
            }}
            error={error && error.includes('Login is required') ? error : null}
          />
          {error && !error.includes('Login is required') && ( // Show other errors here
            <Alert title="Error" color="red" icon={<IconAlertCircle />}>
              {error}
            </Alert>
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={handleMainModalClose}>
              Cancel
            </Button>
            <Button
              onClick={handleOpenConfirmModal}
              leftSection={<IconUserPlus size={16} />}
            >
              Register
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={confirmModalOpened}
        onClose={() => setConfirmModalOpened(false)}
        title={<Text fw={700}>Confirm Registration</Text>}
        centered
        size="sm"
        zIndex={1001} // Ensure it's above the main modal
         overlayProps={{
            backgroundOpacity: 0.25,
            blur: 1,
          }}
      >
        <Stack>
          <Text>
            Do you confirm registering user <Text span fw={700}>{personLogin}</Text> as a new doctor?
          </Text>
          <Text c="dimmed" size="sm">
            This operation will assign the doctor role to the user.
            If the user already exists, their role will be updated if possible.
            This action might not be easily reversible.
          </Text>
          {error && ( // Display error from registration attempt if any, shown after confirm modal reopens
            <Alert title="Previous Attempt Error" color="red" icon={<IconAlertCircle />}>
              {error}
            </Alert>
          )}
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setConfirmModalOpened(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button color="blue" onClick={handleRegisterDoctor} loading={isLoading}>
              Confirm & Register
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

export default RegisterDoctorModal; 