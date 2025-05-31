import React, { useState, useEffect } from 'react';
import { Title, Container, Loader, Alert, Text, Paper, TextInput, Button, Stack, Group, Image, Box, Modal, FileInput } from '@mantine/core';
import { IconAlertCircle, IconUserPlus, IconPhotoEdit, IconUpload } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import UserInfoDisplay from '../../components/UserInfoDisplay';
import useAuthStore from '../../store/authStore';
import PersonService from '../../services/PersonService';
import ImageService from '../../services/ImageService';
import doctorLogo from '../../logos/doctor-logo.png';
import axios from 'axios';
import { notifications } from '@mantine/notifications';
import { v4 as uuidv4 } from 'uuid';

function MyProfilePage() {
  const { token, loginUsername } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personExists, setPersonExists] = useState(true);
  // State for the creation form
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [pesel, setPesel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  // Image states
  const [imageUrl, setImageUrl] = useState(doctorLogo);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Modal and file upload states
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handlePeselChange = (event) => {
    const value = event.currentTarget.value;
    // Allow only numbers and limit to 11 characters
    if (/^\d*$/.test(value) && value.length <= 11) {
      setPesel(value);
      // Clear PESEL-specific errors when user types valid input
      if (createError && createError.includes('PESEL')) {
        setCreateError(null);
      }
    }
  };

  const fetchProfile = async (showLoadingIndicator = true) => {
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      if (showLoadingIndicator) setLoading(false);
      return false;
    }
    if (showLoadingIndicator) setLoading(true);
    setError(null);
    try {
      const data = await PersonService.getMe(token);
      setProfileData(data);
      setPersonExists(true);
      setError(null);
      if (showLoadingIndicator) setLoading(false);
      return true;
    } catch (err) {
      console.error("MyProfilePage: Error fetching profile data:", err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          setPersonExists(false);
          // Notification is good, but we also need to ensure loading stops and no error is shown for this specific case
          notifications.show({
            title: 'Profile Information',
            message: 'Your person record has not been created yet. You can create one below.',
            color: 'blue',
          });
          setError(null); // Clear general error as this is a specific state (no profile)
        } else {
          const errorMsg = err.response.data?.message || `Error fetching profile: ${err.response.status}`;
          setError(errorMsg);
          notifications.show({ title: 'API Error', message: errorMsg, color: 'red' });
          setPersonExists(true); // Assume person might exist if not a 404
        }
      } else {
        const unexpectedErrorMsg = 'An unexpected error occurred while fetching your profile.';
        setError(unexpectedErrorMsg);
        notifications.show({ title: 'Error', message: unexpectedErrorMsg, color: 'red' });
        setPersonExists(true); // Fallback assumption
      }
      setProfileData(null);
      if (showLoadingIndicator) setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchImage = async (personIdToFetch) => {
    if (!token || !personIdToFetch) {
      if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
      setImageUrl(doctorLogo);
      setImageLoading(false);
      return;
    }
    setImageLoading(true);
    setImageError(null);
    if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);

    try {
      const imageDataBlob = await ImageService.getImageByPersonId(personIdToFetch, token);
      if (imageDataBlob instanceof Blob) {
        const objectUrl = URL.createObjectURL(imageDataBlob);
        setImageUrl(objectUrl);
      } else {
        setImageUrl(doctorLogo);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
        setImageUrl(doctorLogo);
      } else {
        setImageError('Failed to load profile image.');
        setImageUrl(doctorLogo);
      }
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    if (profileData && profileData.id) {
      fetchImage(profileData.id);
    } else {
      if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
      setImageUrl(doctorLogo);
      setImageLoading(false);
    }
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
    };
  }, [profileData, token]);

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setFileError(null);
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setFileError('Please select a file to upload.');
      return;
    }
    if (!profileData || !profileData.id) {
      setFileError('User profile data is not available. Cannot upload image.');
      notifications.show({ title: 'Upload Error', message: 'User profile ID is missing.', color: 'red' });
      return;
    }
    setUploading(true);
    setFileError(null);
    try {
      await ImageService.addImage(selectedFile, token);
      notifications.show({ title: 'Upload Successful', message: 'Profile picture has been updated!', color: 'green' });
      ImageService.clearCacheForPerson(profileData.id);
      await fetchImage(profileData.id);
      setModalOpened(false);
      setSelectedFile(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image. Please ensure it is a JPG file and try again.';
      setFileError(errorMessage);
      notifications.show({ title: 'Upload Error', message: errorMessage, color: 'red' });
    } finally {
      setUploading(false);
    }
  };

  const handleCreatePerson = async (event) => {
    event.preventDefault();
    setCreateError(null); // Clear previous errors first

    if (!name.trim() || !surname.trim() || !pesel.trim()) {
      setCreateError('All fields are required. Please fill in Name, Surname, and PESEL.');
      return;
    }

    if (pesel.length !== 11) {
      setCreateError('PESEL must be exactly 11 digits long.');
      return;
    }
    if (!/^\d{11}$/.test(pesel)) {
      setCreateError('PESEL must contain only numbers and be 11 digits long.');
      return;
    }

    setIsCreating(true);
    const newId = uuidv4();
    const personPayload = {
      Id: newId,
      Name: name,
      Surname: surname,
      Pesel: pesel,
    };

    try {
      await PersonService.createPerson(personPayload, token);
      notifications.show({
        title: 'Profile Created',
        message: 'Your profile has been successfully created.',
        color: 'green',
      });
      setName('');
      setSurname('');
      setPesel('');
      await fetchProfile(false);
    } catch (err) {
      console.error("MyProfilePage: Error creating person:", err);
      let errMsg = 'Failed to create profile. Please check the details and try again.'; // Default error
      if (axios.isAxiosError(err) && err.response) {
        // Check for specific PESEL exists error first
        if (err.response.status === 400 && err.response.data?.message === "Person with the pesel identifier already exists.") {
          errMsg = "A person with this PESEL identifier already exists. Please check the PESEL number.";
        } else if (err.response.data?.message) {
          // Other server-provided messages
          errMsg = err.response.data.message;
        } else if (err.response.status) {
          // Generic HTTP error status
          errMsg = `An error occurred: ${err.response.status}. Please try again.`;
        }
      } else if (err.message) {
        // Non-Axios errors (e.g., network error, PersonService internal error)
        errMsg = err.message;
      }
      setCreateError(errMsg);
      notifications.show({ title: 'Creation Error', message: errMsg, color: 'red' });
    }
    setIsCreating(false);
  };

  if (loading) {
    return (
      <Container size="md" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <Loader />
        <Text mt="md">Loading your profile...</Text>
      </Container>
    );
  }

  // If there was an error (other than 404, which is handled by !personExists)
  if (error) {
    return (
      <Container size="md">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" my="lg">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!personExists) {
    return (
      <Container size="md">
        <Title order={2} mb="lg" ta="center">Create Your Profile</Title>
        <Paper p="lg" shadow="sm" radius="md" withBorder>
          <form onSubmit={handleCreatePerson}>
            <Stack>
              <TextInput
                required
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                error={createError && name === '' ? 'Name is required' : null}
              />
              <TextInput
                required
                label="Surname"
                placeholder="Enter your surname"
                value={surname}
                onChange={(event) => setSurname(event.currentTarget.value)}
                error={createError && surname === '' ? 'Surname is required' : null}
              />
              <TextInput
                required
                label="PESEL"
                placeholder="Enter your PESEL number"
                value={pesel}
                onChange={handlePeselChange}
                error={createError && (createError.includes('PESEL') || (createError === 'All fields are required.' && !pesel.trim())) ? createError : null}
              />
              {createError && (
                <Alert title="Creation Error" color="red" icon={<IconAlertCircle />}>
                  {createError}
                </Alert>
              )}
              <Button type="submit" loading={isCreating} leftSection={<IconUserPlus size={18}/>} mt="md">
                Create Profile
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    );
  }

  if (profileData) {
    return (
      <Container size="md">
        <Title order={2} mb="lg" ta="center">My Profile</Title>
        <Paper p="lg" shadow="sm" radius="md" withBorder>
          <Stack align="center">
            <Box w={150} h={150} style={{ borderRadius: '50%', overflow: 'hidden', border: '2px solid #dee2e6' }}>
              {imageLoading ? (
                <Loader size="xl" />
              ) : (
                <Image
                  src={imageUrl}
                  alt="Profile"
                  width={150}
                  height={150}
                  fit="cover"
                  onError={(event) => {
                    if (event.currentTarget.src !== doctorLogo) event.currentTarget.src = doctorLogo;
                    if (imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl);
                    setImageUrl(doctorLogo);
                  }}
                />
              )}
            </Box>
            {imageError && !imageLoading && (
              <Text c="red" size="sm" ta="center">{imageError}</Text>
            )}
            <Button
              onClick={() => setModalOpened(true)}
              leftSection={<IconPhotoEdit size={18} />}
              variant="outline"
              mt="sm"
            >
              Change Picture
            </Button>
          </Stack>
          <UserInfoDisplay userData={profileData} loginUsername={loginUsername} />
        </Paper>

        <Modal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setSelectedFile(null);
            setFileError(null);
          }}
          title="Upload New Profile Picture"
          centered
        >
          <Stack>
            <FileInput
              label="Profile picture"
              placeholder="Choose a JPG image"
              accept="image/jpeg"
              value={selectedFile}
              onChange={handleFileSelect}
              error={fileError && !selectedFile ? "Please select a JPG file." : fileError}
              leftSection={<IconUpload size={18} />}
            />
            {fileError && (
              <Text c="red" size="sm">{fileError}</Text>
            )}
            <Button
              onClick={handleImageUpload}
              loading={uploading}
              disabled={!selectedFile || uploading}
              fullWidth
              mt="md"
            >
              Upload Image
            </Button>
          </Stack>
        </Modal>
      </Container>
    );
  }
  
  return (
    <Container size="md" style={{ textAlign: 'center', paddingTop: '50px' }}>
      <Text>Profile data is currently unavailable. Please try refreshing.</Text>
       <Text fs="italic" c="dimmed" size="sm" mt="xs">
        (Token: {token ? 'Present' : 'Absent'}. This screen indicates an unexpected state.)
      </Text>
    </Container>
  );
}

export default MyProfilePage; 