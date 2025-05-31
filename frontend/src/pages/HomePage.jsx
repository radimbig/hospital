import React from 'react';
import { Container, Title, Text, Paper } from '@mantine/core';
import '@mantine/core/styles.css'; // For Mantine v7+

function HomePage() {
  return (
    <Container>
      <Paper p="md" shadow="xs">
        <Title order={2}>Home Page</Title>
        <Text>Welcome! You are logged in.</Text>
      </Paper>
    </Container>
  );
}

export default HomePage; 