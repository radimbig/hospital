import React, { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Box, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
// We will create these doctor-specific pages next
import DoctorMyProfilePage from './DoctorMyProfilePage'; 
import DoctorAppointmentsPage from './DoctorAppointmentsPage'; 
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import PersonService from '../../services/PersonService';
import AppointmentsService from '../../services/AppointmentsService'; // Import AppointmentsService
import { notifications } from '@mantine/notifications';

// TODO: Replace with actual icons from @tabler/icons-react or similar
// import { IconUserCircle, IconCalendarTime, IconLogout } from '@tabler/icons-react';
const IconPlaceholder = ({ children }) => <Box mr="xs" component="span">{children}</Box>;

function DoctorPage() {
  const [opened, { toggle }] = useDisclosure();
  const [activeContent, setActiveContent] = useState('profile'); // 'profile' or 'appointments'
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    PersonService.clearCache();
    AppointmentsService.clearCache(); // Clear appointments cache on logout
    navigate('/login');
    notifications.show({
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
        color: 'blue',
    });
  };

  let contentComponent;
  if (activeContent === 'profile') {
    contentComponent = <DoctorMyProfilePage />;
  } else if (activeContent === 'appointments') {
    contentComponent = <DoctorAppointmentsPage />;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} size="sm" />
          <Title order={3}>Doctor Dashboard</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          href="#"
          label="My Profile"
          // leftSection={<IconUserCircle size="1rem" />}
          leftSection={<IconPlaceholder>P</IconPlaceholder>}
          onClick={(event) => {
            event.preventDefault();
            setActiveContent('profile');
            if (opened) toggle();
          }}
          active={activeContent === 'profile'}
        />
        <NavLink
          href="#"
          label="Appointments"
          // leftSection={<IconCalendarTime size="1rem" />}
          leftSection={<IconPlaceholder>A</IconPlaceholder>}
          onClick={(event) => {
            event.preventDefault();
            setActiveContent('appointments');
            if (opened) toggle();
          }}
          active={activeContent === 'appointments'}
        />
        <NavLink
          href="#"
          label="Logout"
          // leftSection={<IconLogout size="1rem" />}
          leftSection={<IconPlaceholder>L</IconPlaceholder>}
          onClick={(event) => {
            event.preventDefault();
            handleLogout();
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {contentComponent}
      </AppShell.Main>
    </AppShell>
  );
}

export default DoctorPage; 