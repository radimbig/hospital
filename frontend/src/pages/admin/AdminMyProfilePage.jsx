import React, { useState, useEffect } from 'react';
import { Title, Container, Loader, Alert, Text, Paper, Image, Box, Modal, FileInput, Button, Stack } from '@mantine/core';
import { IconAlertCircle, IconPhotoEdit, IconUpload } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import UserInfoDisplay from '../../components/UserInfoDisplay';
import useAuthStore from '../../store/authStore';
import PersonService from '../../services/PersonService';
import ImageService from '../../services/ImageService';
import doctorLogo from '../../logos/doctor-logo.png';
import axios from 'axios';
import { notifications } from '@mantine/notifications';

function AdminMyProfilePage() {
  const token = useAuthStore((state) => state.token);
  const loginUsername = useAuthStore((state) => state.loginUsername);
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Image states
  const [imageUrl, setImageUrl] = useState(doctorLogo);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Modal and file upload states
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAdminProfile = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      try {
        const data = await PersonService.getMe(token);
        if (isMounted) {
          setProfileData(data);
        }
      } catch (err) {
        console.error("AdminMyProfilePage: Error fetching profile data:", err);
        if (isMounted) {
          if (axios.isAxiosError(err) && err.response && err.response.status === 404) {
            setError('Admin profile not found. This is unexpected. Please contact support.');
          } else {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch admin profile data.';
            setError(errorMsg);
          }
          setProfileData(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (token) {
      fetchAdminProfile();
    } else {
      if (isMounted) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        setProfileData(null); 
      }
    }
    return () => { isMounted = false; };
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
      setFileError('Admin profile data is not available. Cannot upload image.');
      notifications.show({ title: 'Upload Error', message: 'Admin profile ID is missing.', color: 'red' });
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

  if (loading) {
    return (
      <Container size="md" style={{ textAlign: 'center', paddingTop: '50px' }}>
        <Loader />
        <Text mt="md">Loading admin profile...</Text>
      </Container>
    );
  }

  if (error && !profileData) {
    return (
      <Container size="md">
        <Alert icon={<IconAlertCircle size="1rem" />} title="Error!" color="red" my="lg">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container size="md">
        <Paper p="xl" shadow="sm" radius="md" withBorder mt="xl" style={{ textAlign: 'center' }}>
          <Title order={2}>Admin Profile</Title>
          <Text mt="md">
            {error ? error : 'Admin profile data is not available.'}
          </Text>
          {token ? null : <Text c="dimmed" fs="italic" size="sm"> (No active session)</Text>}
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md">
      <Paper p="xl" shadow="sm" radius="md" withBorder mt="xl">
        <Title order={2} mb="xl" ta="center">Admin Profile</Title>
        <Stack align="center" mb="xl">
          <Box w={150} h={150} style={{ borderRadius: '50%', overflow: 'hidden', border: '2px solid #dee2e6' }}>
            {imageLoading ? (
              <Loader size="xl" />
            ) : (
              <Image
                src={imageUrl}
                alt="Admin Profile"
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

export default AdminMyProfilePage; 