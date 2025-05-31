import React from 'react';
import { Paper, Title, Text, Group, Stack, Badge } from '@mantine/core';
import '@mantine/core/styles.css';

function UserInfoDisplay({ userData, loginUsername }) {
  
  const getRoleName = (roleValue) => {
    switch (roleValue) {
      case 0:
        return 'Doctor';
      case 1:
        return 'Patient';
      case 2:
        return 'Admin';
      default:
        return 'Unknown Role';
    }
  };

  const displayUser = userData || {
    name: 'N/A',
    surname: 'N/A',
    pesel: 'N/A',
    role: -1,
    id: 'N/A',
  };

  const roleName = getRoleName(displayUser.role);
  let roleColor = 'gray';
  if (displayUser.role === 0) roleColor = 'blue';
  if (displayUser.role === 1) roleColor = 'green';
  if (displayUser.role === 2) roleColor = 'orange';

  return (
    <Paper p="lg" shadow="sm" radius="md" withBorder>
      <Stack>
        <Title order={4} mb="xs">User Details</Title>
        <Group>
          <Text fw={500} miw={80}>ID:</Text>
          <Text>{displayUser.id}</Text>
        </Group>
        {loginUsername && (
          <Group>
            <Text fw={500} miw={80}>Login:</Text>
            <Text>{loginUsername}</Text>
          </Group>
        )}
        <Group>
          <Text fw={500} miw={80}>Name:</Text>
          <Text>{displayUser.name}</Text>
        </Group>
        <Group>
          <Text fw={500} miw={80}>Surname:</Text>
          <Text>{displayUser.surname}</Text>
        </Group>
        <Group>
          <Text fw={500} miw={80}>PESEL:</Text>
          <Text>{displayUser.pesel || 'N/A'}</Text>
        </Group>
        <Group>
          <Text fw={500} miw={80}>Role:</Text>
          <Badge color={roleColor} variant="light">
            {roleName}
          </Badge>
        </Group>
      </Stack>
    </Paper>
  );
}

export default UserInfoDisplay; 