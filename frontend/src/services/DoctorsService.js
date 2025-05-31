import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

let cachedDoctors = null;

const DoctorsService = {
  getDoctors: async (token) => {
    if (cachedDoctors) {
      console.log('DoctorsService: Returning cached doctors');
      return Promise.resolve(cachedDoctors);
    }

    if (!API_URL) {
      console.error('DoctorsService: API URL is not configured.');
      return Promise.reject(new Error('API URL is not configured.'));
    }

    console.log('DoctorsService: Fetching doctors from API');
    try {
      const response = await axios.get(`${API_URL}/api/person/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // The actual doctor data seems to be in response.data directly based on the example
      // Each item in the array has a 'person' object and 'login'
      // We need login, name, surname, pesel.
      // name, surname, pesel are in the 'person' object.
      const doctors = response.data.map(doc => ({
        login: doc.login,
        id: doc.id, // doctor entity id
        personId: doc.person.id, // person entity id
        name: doc.person.name,
        surname: doc.person.surname,
        pesel: doc.person.pesel,
        appointments: null, // Initialize appointments field
        // role: doc.person.role, // Role is 0 for Doctor based on example, can be mapped if needed
      }));
      cachedDoctors = doctors;
      console.log('DoctorsService: Successfully fetched and processed doctors:', doctors);
      return doctors;
    } catch (error) {
      console.error('DoctorsService: Error fetching doctors:', error.response || error.message);
      // It's good practice to throw the error so the caller can handle it
      // or return a more specific error structure if preferred.
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      } else {
        throw error; // Re-throw the original error if no specific message
      }
    }
  },

  attachAppointmentsToDoctor: async (doctorLogin, token, count = 50) => {
    if (!cachedDoctors) {
      console.warn('DoctorsService: attachAppointmentsToDoctor called before getDoctors or cache is cleared. Fetch doctors first.');
      // Optionally, you could call getDoctors here, but it might lead to multiple calls if not handled carefully.
      // For now, we'll assume getDoctors is called first by the UI logic.
      return Promise.reject(new Error('Doctor list not available. Call getDoctors first.'));
    }

    const doctorIndex = cachedDoctors.findIndex(doc => doc.login === doctorLogin);

    if (doctorIndex === -1) {
      console.error(`DoctorsService: Doctor with login ${doctorLogin} not found in cache.`);
      return Promise.reject(new Error(`Doctor with login ${doctorLogin} not found.`));
    }

    // Check if appointments are already fetched and attached for this doctor
    if (cachedDoctors[doctorIndex].appointments !== null) {
      console.log(`DoctorsService: Appointments for doctor ${doctorLogin} are already cached.`);
      return Promise.resolve(); // Indicate success, appointments already there
    }

    if (!API_URL) {
      console.error('DoctorsService: API URL is not configured for fetching appointments.');
      return Promise.reject(new Error('API URL is not configured.'));
    }

    console.log(`DoctorsService: Fetching appointments for doctor ${doctorLogin}, count: ${count}`);
    try {
      const response = await axios.get(`${API_URL}/api/Appointment/${doctorLogin}/${count}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Assuming response.data is the array of appointments
      cachedDoctors[doctorIndex].appointments = response.data;
      console.log(`DoctorsService: Successfully fetched and attached appointments for ${doctorLogin}:`, response.data);
      return Promise.resolve(); // Indicate success
    } catch (error) {
      console.error(`DoctorsService: Error fetching appointments for doctor ${doctorLogin}:`, error.response || error.message);
      // Don't pollute the doctor object with an error state for appointments here, let the caller handle it.
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      } else {
        throw error;
      }
    }
  },

  deleteAppointmentAndUpdateDoctorCache: async (appointmentId, doctorLogin, token) => {
    if (!API_URL) {
      console.error('DoctorsService: API URL is not configured for deleting appointment.');
      return Promise.reject(new Error('API URL is not configured.'));
    }
    if (!cachedDoctors) {
        console.error('DoctorsService: Doctor cache is not available. Cannot update after deletion.');
        return Promise.reject(new Error('Doctor cache not available.'));
    }

    console.log(`DoctorsService: Attempting to delete appointment ${appointmentId} via API.`);
    try {
      await axios.delete(`${API_URL}/api/Appointment/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`DoctorsService: Successfully deleted appointment ${appointmentId} via API.`);

      // Update the cache
      const doctorIndex = cachedDoctors.findIndex(doc => doc.login === doctorLogin);
      if (doctorIndex !== -1 && cachedDoctors[doctorIndex].appointments) {
        cachedDoctors[doctorIndex].appointments = cachedDoctors[doctorIndex].appointments.filter(
          appt => appt.id !== appointmentId
        );
        console.log(`DoctorsService: Appointment ${appointmentId} removed from cached appointments for doctor ${doctorLogin}.`);
      } else {
        console.warn(`DoctorsService: Doctor ${doctorLogin} not found in cache or no appointments array to update after deletion, or appointments were not attached yet.`);
        // This isn't necessarily an error for the deletion itself, but the cache update might not have happened as expected.
      }
      return Promise.resolve(); // Deletion successful
    } catch (error) {
      console.error(`DoctorsService: Error deleting appointment ${appointmentId}:`, error.response || error.message);
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || JSON.stringify(error.response.data));
      } else {
        throw error;
      }
    }
  },

  async registerDoctor(personLogin, token) {
    if (!API_URL) {
      console.error('DoctorsService: API_URL is not configured for registerDoctor.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!personLogin) {
        console.error('DoctorsService: personLogin is required for registerDoctor.');
        return Promise.reject(new Error('personLogin is required.'));
    }
    if (!token) {
      console.error('DoctorsService: Token is required for registerDoctor.');
      return Promise.reject(new Error('Token is required.'));
    }

    console.log(`DoctorsService: Attempting to register user ${personLogin} as a doctor.`);
    try {
      const response = await axios.post(
        `${API_URL}/api/person/role`,
        { personLogin: personLogin, Role: 0 }, // Role 0 for Doctor
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Axios typically throws for non-2xx statuses, so a direct check for 200
      // here is more of an explicit confirmation if code reaches this point without error.
      if (response.status === 200) {
        const responseData = response.data;
        console.log('DoctorsService: Successfully registered/updated role for doctor. API Response:', responseData);

        if (cachedDoctors === null) {
          cachedDoctors = [];
        }

        const doctorInfoFromResponse = {
            name: responseData.name,
            surname: responseData.surname,
            // The 'id' from this response is the person's ID.
            // For consistency in cache, we use it for both 'id' and 'personId' here.
            id: responseData.id, 
            personId: responseData.id 
        };

        const existingDoctorIndex = cachedDoctors.findIndex(doc => doc.login === personLogin);

        if (existingDoctorIndex !== -1) {
          // Update existing doctor: preserve fields not in this response (like pesel, appointments)
          cachedDoctors[existingDoctorIndex] = {
            ...cachedDoctors[existingDoctorIndex],
            ...doctorInfoFromResponse, // Update with new data (name, surname, ids)
            login: personLogin // Ensure login is correctly set (should be same)
          };
          console.log(`DoctorsService: Updated existing doctor ${personLogin} in cache.`);
        } else {
          // Add new doctor to cache
          cachedDoctors.push({
            login: personLogin,
            ...doctorInfoFromResponse,
            pesel: null, // PESEL is not available from this specific API endpoint
            appointments: null // Initialize appointments for a new cache entry
          });
          console.log(`DoctorsService: Added new doctor ${personLogin} to cache.`);
        }
        return responseData; // Return the doctor info from API
      } else {
        // This path might not be hit if Axios throws on non-200, but included for robustness.
        const errorMessage = `DoctorsService: API responded with status ${response.status} for registerDoctor.`;
        console.error(errorMessage, response.data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`DoctorsService: Error registering doctor ${personLogin}:`, error.response?.data || error.message || error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else if (error.response && error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
      throw error; // Re-throw original error if no specific message found
    }
  },

  clearDoctorAppointmentsCache: (doctorLogin) => {
    if (!cachedDoctors) {
      console.warn('DoctorsService: clearDoctorAppointmentsCache called but no doctors are cached.');
      return;
    }
    const doctorIndex = cachedDoctors.findIndex(doc => doc.login === doctorLogin);
    if (doctorIndex !== -1) {
      if (cachedDoctors[doctorIndex].appointments !== null) {
        cachedDoctors[doctorIndex].appointments = null;
        console.log(`DoctorsService: Cleared appointments cache for doctor ${doctorLogin}.`);
      } else {
        console.log(`DoctorsService: No appointments were cached for doctor ${doctorLogin} to clear.`);
      }
    } else {
      console.warn(`DoctorsService: Doctor ${doctorLogin} not found in cache, cannot clear their appointments cache.`);
    }
  },

  clearCache: () => {
    console.log('DoctorsService: Clearing entire doctors cache (including all attached appointments).');
    cachedDoctors = null;
  },
};

export default DoctorsService; 