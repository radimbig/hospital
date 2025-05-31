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

// Renamed function to DoctorMyProfilePage
function DoctorMyProfilePage() {
  const { token, loginUsername } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [personExists, setPersonExists] = useState(true);

  const [imageUrl, setImageUrl] = useState(doctorLogo);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(null);

  // State for image upload modal
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [pesel, setPesel] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const handlePeselChange = (event) => {
    const value = event.currentTarget.value;
    if (/^\d*$/.test(value) && value.length <= 11) {
      setPesel(value);
      if (createError && createError.includes('PESEL')) {
        setCreateError(null);
      }
    }
  };

  const fetchProfile = async (showLoadingIndicator = true) => {
    console.log('[DoctorMyProfilePage] fetchProfile FUNCTION CALLED. Token present:', !!token);
    if (!token) {
      setError('Authentication token not found. Please log in again.');
      if (showLoadingIndicator) setLoading(false);
      return false;
    }
    if (showLoadingIndicator) setLoading(true);
    setError(null);
    try {
      const data = await PersonService.getMe(token);
      console.log('[DoctorMyProfilePage] fetchProfile SUCCESS. Data received:', data);
      setProfileData(data);
      setPersonExists(true);
      setError(null);
      if (showLoadingIndicator) setLoading(false);
      return true;
    } catch (err) {
      console.error("[DoctorMyProfilePage] Error fetching profile data:", err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          setPersonExists(false);
          notifications.show({
            title: 'Profile Information',
            message: 'Your person record has not been created yet. You can create one below.',
            color: 'blue',
          });
          setError(null);
        } else {
          const errorMsg = err.response.data?.message || `Error fetching profile: ${err.response.status}`;
          setError(errorMsg);
          notifications.show({ title: 'API Error', message: errorMsg, color: 'red' });
          setPersonExists(true);
        }
      } else {
        const unexpectedErrorMsg = 'An unexpected error occurred while fetching your profile.';
        setError(unexpectedErrorMsg);
        notifications.show({ title: 'Error', message: unexpectedErrorMsg, color: 'red' });
        setPersonExists(true);
      }
      setProfileData(null);
      if (showLoadingIndicator) setLoading(false);
      return false;
    }
  };

  const fetchImage = async (personIdToFetch) => {
    console.log('[DoctorMyProfilePage] fetchImage called. personIdToFetch:', personIdToFetch, 'Token present:', !!token);
    if (!token || !personIdToFetch) {
      console.error('[DoctorMyProfilePage] ImageService call SKIPPED in fetchImage: Token or personIdToFetch is missing or falsy.', { tokenPresent: !!token, personIdToFetch });
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(doctorLogo);
      setImageLoading(false);
      return;
    }
    setImageLoading(true);
    setImageError(null);

    if (imageUrl && imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageUrl);
    }

    try {
      const imageDataBlob = await ImageService.getImageByPersonId(personIdToFetch, token);
      if (imageDataBlob instanceof Blob) {
        const objectUrl = URL.createObjectURL(imageDataBlob);
        setImageUrl(objectUrl);
        console.log('[DoctorMyProfilePage] fetchImage SUCCESS. Created object URL:', objectUrl);
      } else {
        console.error("[DoctorMyProfilePage] fetchImage Expected a Blob but received", typeof imageDataBlob, "Using placeholder.");
        setImageUrl(doctorLogo);
      }
    } catch (err) {
      console.error("DoctorMyProfilePage: Error fetching image:", err);
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
      notifications.show({
        title: 'Upload Error',
        message: 'User profile ID is missing.',
        color: 'red',
      });
      return;
    }

    setUploading(true);
    setFileError(null);

    try {
      await ImageService.addImage(selectedFile, token);
      notifications.show({
        title: 'Upload Successful',
        message: 'Profile picture has been updated!',
        color: 'green',
      });

      ImageService.clearCacheForPerson(profileData.id);
      await fetchImage(profileData.id);

      setModalOpened(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("DoctorMyProfilePage: Error uploading image:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload image. Please ensure it is a JPG file and try again.';
      setFileError(errorMessage);
      notifications.show({
        title: 'Upload Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    console.log('[DoctorMyProfilePage] Profile fetch EFFECT RUNNING. Token present:', !!token);
    fetchProfile();
  }, [token]);

  useEffect(() => {
    console.log('[DoctorMyProfilePage] Image fetch useEffect triggered. ProfileData:', profileData, 'Token present:', !!token);
    if (profileData && profileData.id) {
      console.log('[DoctorMyProfilePage] Condition met: profileData and profileData.id are present. Attempting to fetch image for ID:', profileData.id);
      fetchImage(profileData.id);
    } else {
      console.log('[DoctorMyProfilePage] Condition NOT met for fetching image: profileData or profileData.id is missing/falsy. Using placeholder.');
      if (!profileData) {
        console.log('[DoctorMyProfilePage] Reason: profileData is falsy.');
      } else if (!profileData.id) {
        console.log('[DoctorMyProfilePage] Reason: profileData.id is falsy. Value:', profileData.id);
      }
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(doctorLogo);
      setImageLoading(false);
    }

    return () => {
      console.log('[DoctorMyProfilePage] Image fetch useEffect CLEANUP. Current imageUrl:', imageUrl);
      if (imageUrl && imageUrl.startsWith('blob:')) {
        console.log('[DoctorMyProfilePage] Revoking object URL:', imageUrl);
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [profileData, token]);

  const handleCreatePerson = async (event) => {
    event.preventDefault();
    setCreateError(null);

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
      console.error("DoctorMyProfilePage: Error creating person:", err); 
      let errMsg = 'Failed to create profile. Please check the details and try again.';
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400 && err.response.data?.message === "Person with the pesel identifier already exists.") {
          errMsg = "A person with this PESEL identifier already exists. Please check the PESEL number.";
        } else if (err.response.data?.message) {
          errMsg = err.response.data.message;
        } else if (err.response.status) {
          errMsg = `An error occurred: ${err.response.status}. Please try again.`;
        }
      } else if (err.message) {
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
                    console.error("DoctorMyProfilePage: Image onError triggered, using placeholder.");
                    if (event.currentTarget.src !== doctorLogo) {
                        event.currentTarget.src = doctorLogo;
                    }
                    if (imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl); // prevent memory leak
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

export default DoctorMyProfilePage; // Renamed export 