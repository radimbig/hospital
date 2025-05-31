import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

class AppointmentsService {
  _appointmentsData = null;
  _fetchPromise = null;

  constructor() {
    if (!AppointmentsService.instance) {
      AppointmentsService.instance = this;
    }
    return AppointmentsService.instance;
  }

  async getMyAppointments(token, count = 30) {
    if (!API_URL) {
      console.error('AppointmentsService: API_URL is not configured.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('AppointmentsService: Token is required to fetch appointments.');
      return Promise.reject(new Error('Token is required.'));
    }

    const validCount = Math.min(Math.max(1, count), 100); // Ensure count is between 1 and 100

    // If data for this specific count is cached, return it.
    // For simplicity, we'll cache only the last requested count.
    // A more complex cache could store results for different counts.
    if (this._appointmentsData && this._appointmentsData.requestedCount === validCount) {
      // console.log('AppointmentsService: Returning cached appointments data', this._appointmentsData.data);
      return Promise.resolve(this._appointmentsData.data);
    }

    if (this._fetchPromise) {
      // console.log('AppointmentsService: Fetch in progress, returning existing promise');
      return this._fetchPromise;
    }

    // console.log(`AppointmentsService: Initiating new fetch for /api/Appointment/me/${validCount}`);
    this._fetchPromise = axios.get(`${API_URL}/api/appointment/me/${validCount}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      this._appointmentsData = { data: response.data, requestedCount: validCount };
      // console.log('AppointmentsService: Appointments data fetched and cached', this._appointmentsData.data);
      this._fetchPromise = null; // Clear promise once resolved
      return this._appointmentsData.data;
    })
    .catch(error => {
      // console.error('AppointmentsService: Error fetching appointments data', error);
      this._fetchPromise = null; // Clear promise on error too
      // Do not cache error, let the component handle it.
      throw error; // Re-throw so the calling component can handle it
    });

    return this._fetchPromise;
  }

  async createAppointment(appointmentData, token) {
    if (!API_URL) {
      console.error('AppointmentsService: API_URL is not configured for createAppointment.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('AppointmentsService: Token is required to create appointment.');
      return Promise.reject(new Error('Token is required for appointment creation.'));
    }
    if (!appointmentData) {
      console.error('AppointmentsService: Appointment data is required.');
      return Promise.reject(new Error('Appointment data is required.'));
    }

    // console.log('AppointmentsService: Creating appointment with data:', appointmentData);
    try {
      const response = await axios.post(`${API_URL}/api/appointment/me`, appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // After successful creation, invalidate the cache so getMyAppointments fetches fresh data.
      this.clearCache(); 
      // console.log('AppointmentsService: Appointment created successfully, cache cleared.', response.data);
      return response.data; // Or response, depending on what the caller needs
    } catch (error) {
      // console.error('AppointmentsService: Error creating appointment', error);
      // Let the calling component handle specific error messages and UI updates.
      throw error; 
    }
  }

  async adminCreateAppointment(appointmentData, token) {
    if (!API_URL) {
      console.error('AppointmentsService: API_URL is not configured for adminCreateAppointment.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('AppointmentsService: Token is required for admin to create appointment.');
      return Promise.reject(new Error('Token is required.'));
    }
    if (!appointmentData) {
      console.error('AppointmentsService: Appointment data is required for admin creation.');
      return Promise.reject(new Error('Appointment data is required.'));
    }
    console.log('AppointmentsService: Admin creating appointment with data:', appointmentData);
    try {
      const response = await axios.post(`${API_URL}/api/appointment/`, appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('AppointmentsService: Admin successfully created appointment.', response.data);
      return response.data;
    } catch (error) {
      console.error('AppointmentsService: Error during admin creation of appointment', error.response?.data || error.message);
      throw error; 
    }
  }

  async deleteAppointment(appointmentId, token) {
    if (!API_URL) {
      console.error('AppointmentsService: API_URL is not configured for deleteAppointment.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('AppointmentsService: Token is required to delete appointment.');
      return Promise.reject(new Error('Token is required for appointment deletion.'));
    }
    if (!appointmentId) {
      console.error('AppointmentsService: Appointment ID is required.');
      return Promise.reject(new Error('Appointment ID is required.'));
    }

    // console.log('AppointmentsService: Deleting appointment with ID:', appointmentId);
    try {
      const response = await axios.delete(`${API_URL}/api/appointment/${appointmentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // After successful deletion, invalidate the cache so getMyAppointments fetches fresh data.
      this.clearCache(); 
      // console.log('AppointmentsService: Appointment deleted successfully, cache cleared.');
      return response.data; // Or response status, depending on what the caller needs
    } catch (error) {
      // console.error('AppointmentsService: Error deleting appointment', error);
      throw error; 
    }
  }

  clearCache() {
    // console.log('AppointmentsService: Clearing appointments cache');
    this._appointmentsData = null;
    this._fetchPromise = null;
  }
}

const instance = new AppointmentsService();
export default instance; 