import React, { useState } from 'react';
import { AppShell, Burger, Group, NavLink, Box, Title, Container, Paper, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import '@mantine/core/styles.css';
import AdminMyProfilePage from './AdminMyProfilePage'; 
import AdminManagementPage from './AdminManagementPage';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import PersonService from '../../services/PersonService';
import AppointmentsService from '../../services/AppointmentsService';
import DoctorsService from '../../services/DoctorsService';
import { notifications } from '@mantine/notifications';
// You can use actual icons from @tabler/icons-react if you like
// import { IconUserCircle, IconLogout } from '@tabler/icons-react';

const IconPlaceholder = ({ children }) => <Box mr="xs" component="span">{children}</Box>;

function AdminPage() {
  const [opened, { toggle }] = useDisclosure();
  const [activeContent, setActiveContent] = useState('dashboard'); // Default to a dashboard view
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    PersonService.clearCache(); 
    AppointmentsService.clearCache(); 
    DoctorsService.clearCache();
    navigate('/login');
    notifications.show({
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
        color: 'blue',
    });
  };

  let contentComponent;
  if (activeContent === 'profile') {
    contentComponent = <AdminMyProfilePage />;
  } else if (activeContent === 'management') {
    contentComponent = <AdminManagementPage />;
  } else if (activeContent === 'dashboard') {
    // Placeholder for a main admin dashboard view
    contentComponent = (
      <Container>
        <Paper p="md" shadow="xs">
          <Title order={2}>Admin Dashboard</Title>
          <Text>Welcome, Administrator! Main dashboard content will go here.</Text>
          {/* TODO: Add admin-specific dashboard components and functionality */}
        </Paper>
      </Container>
    );
  } 
  // Add more content types as needed, e.g., user management, system settings etc.

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
          <Title order={3}>Admin Panel</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          href="#"
          label="Dashboard"
          // leftSection={<IconLayoutDashboard size="1rem" />} // Example icon
          leftSection={<IconPlaceholder>D</IconPlaceholder>}
          onClick={(event) => {
            event.preventDefault();
            setActiveContent('dashboard');
            if (opened) toggle();
          }}
          active={activeContent === 'dashboard'}
        />
        <NavLink
          href="#"
          label="My Profile"
          // leftSection={<IconUserCircle size="1rem" />} // Example icon
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
          label="Management"
          // leftSection={<IconSettings size="1rem" />} // Example icon
          leftSection={<IconPlaceholder>M</IconPlaceholder>}
          onClick={(event) => {
            event.preventDefault();
            setActiveContent('management');
            if (opened) toggle();
          }}
          active={activeContent === 'management'}
        />
        <NavLink
          href="#"
          label="Logout"
          // leftSection={<IconLogout size="1rem" />} // Example icon
          leftSection={<IconPlaceholder>L</IconPlaceholder>}
          onClick={(event) => {
            event.preventDefault();
            handleLogout();
          }}
        />
        {/* Add more NavLinks here for other admin functionalities */}
      </AppShell.Navbar>

      <AppShell.Main>
        {contentComponent}
      </AppShell.Main>
    </AppShell>
  );
}

export default AdminPage; 