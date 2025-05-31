import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Paper, Anchor, Text, Image, Center, Box } from '@mantine/core';
import '@mantine/core/styles.css'; // For Mantine v7+
import { Notifications, notifications } from '@mantine/notifications';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import useAuthStore from '../store/authStore';
import { getUserDetailsFromDecodedToken } from '../utils/authUtils';
import kamsoftLogo from '../kamsoft_logo.png'; // Import the logo from src

const API_URL = process.env.REACT_APP_API_URL;

function LoginPage() {
  const [username, setUsername] = useState(''); // Changed from login to username for clarity
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!API_URL) {
      notifications.show({
        title: 'Configuration Error',
        message: 'API URL is not configured. Please check your .env.debug file.',
        color: 'red',
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        login: username, // Ensure payload matches API expectation (login or username)
        password,
      });

      const token = response.data?.token || response.data; // Handle if token is root or nested

      if (typeof token !== 'string') {
        console.error('Token is not a string:', token);
        notifications.show({
          title: 'Login Error',
          message: 'Received an invalid token from the server.',
          color: 'red',
        });
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const userDetails = getUserDetailsFromDecodedToken(decodedToken);

      if (userDetails) {
        setAuth(token, userDetails.userId, userDetails.userRole, username);
        notifications.show({
          title: 'Successful Login',
          message: `You logged in as ${userDetails.userRole}`,
          color: 'teal',
        });
        // Navigation will be handled by App.js based on isAuthenticated state
      } else {
        notifications.show({
          title: 'Login Error',
          message: 'Could not extract user details from token.',
          color: 'red',
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      let errorMessage = 'Failed to log in. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid username or password.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = `An error occurred: ${error.response.status}`;
        }
      }
      notifications.show({
        title: 'Login Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationClick = () => {
    notifications.show({
      title: 'Registration Unavailable',
      message: 'Registration is temporarily unavailable.',
      color: 'yellow',
    });
  };

  return (
    <Container size={420} my={40}>
      <Center>
        <Box mb="xl"> {/* Added Box for margin */} 
          <Image src={kamsoftLogo} alt="Kamsoft Logo" maw={200} mah={100} fit="contain" />
        </Box>
      </Center>
      <Title order={1} ta="center">Welcome!</Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Don't have an account?{'	'}
        <Anchor component="button" size="sm" onClick={handleRegistrationClick}>
          Register
        </Anchor>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={handleLogin}>
          <TextInput
            label="Username"
            placeholder="Your username" // Changed from login
            required
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
            name="username" // Added for clarity/testing
          />
          <TextInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            name="password" // Added for clarity/testing
          />
          <Button fullWidth mt="xl" type="submit" loading={loading}>
            Log in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}

// This component needs to be wrapped by MantineProvider and Notifications
// at the App level for notifications to work.
export default LoginPage; 