import React, { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Text, Box, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
// Adjusted paths for components within the same directory
import MyProfilePage from './MyProfilePage';
import MyAppointmentsPage from './MyAppointmentsPage';
// Adjusted paths for store and services
import useAuthStore from '../../store/authStore'; 
import { useNavigate } from 'react-router-dom';
import PersonService from '../../services/PersonService';
import AppointmentsService from '../../services/AppointmentsService';
import { notifications } from '@mantine/notifications';

const IconPlaceholder = ({ children }) => <Box mr="xs">{children}</Box>;

function PatientPage() {
  const [opened, { toggle }] = useDisclosure();
  const [activeContent, setActiveContent] = useState('profile'); 
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth(); 
    PersonService.clearCache(); 
    AppointmentsService.clearCache(); // Added to clear appointments cache as well
    navigate('/login');
    notifications.show({ 
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
        color: 'blue',
    });
  };

  let contentComponent;
  if (activeContent === 'profile') {
    contentComponent = <MyProfilePage />;
  } else if (activeContent === 'appointments') {
    contentComponent = <MyAppointmentsPage />;
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
          <Title order={3}>Patient Dashboard</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          href="#"
          label="My Profile"
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
          label="My Appointments"
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

export default PatientPage; 