import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

class PersonService {
  _personData = null;
  _fetchPromise = null;

  constructor() {
    if (!PersonService.instance) {
      PersonService.instance = this;
    }
    return PersonService.instance;
  }

  async getMe(token) {
    if (!API_URL) {
      console.error('PersonService: API_URL is not configured.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('PersonService: Token is required to fetch profile.');
      return Promise.reject(new Error('Token is required.'));
    }

    if (this._personData) {
      // console.log('PersonService: Returning cached data', this._personData);
      return Promise.resolve(this._personData);
    }

    if (this._fetchPromise) {
      // console.log('PersonService: Fetch in progress, returning existing promise');
      return this._fetchPromise;
    }

    // console.log('PersonService: Initiating new fetch for /api/person/me');
    this._fetchPromise = axios.get(`${API_URL}/api/person/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(response => {
      this._personData = response.data;
      // console.log('PersonService: Data fetched and cached', this._personData);
      this._fetchPromise = null; // Clear promise once resolved
      return this._personData;
    })
    .catch(error => {
      // console.error('PersonService: Error fetching data', error);
      this._fetchPromise = null; // Clear promise on error too
      // Do not cache error, let the component handle it. Specifically 404.
      throw error; // Re-throw so the calling component can handle it
    });

    return this._fetchPromise;
  }

  async createPerson(personDataWithId, token) {
    if (!API_URL) {
      console.error('PersonService: API_URL is not configured for createPerson.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('PersonService: Token is required to create person.');
      return Promise.reject(new Error('Token is required for person creation.'));
    }
    if (!personDataWithId) {
      console.error('PersonService: Person data is required.');
      return Promise.reject(new Error('Person data is required.'));
    }

    // console.log('PersonService: Creating person with data:', personDataWithId);
    try {
      const response = await axios.post(`${API_URL}/api/Person/register`, personDataWithId, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // After successful creation, invalidate the cache so getMe fetches fresh data.
      this.clearCache(); 
      // console.log('PersonService: Person created successfully, cache cleared.', response.data);
      return response.data; // Or response, depending on what the caller needs
    } catch (error) {
      // console.error('PersonService: Error creating person', error);
      // Let the calling component handle specific error messages and UI updates.
      throw error; 
    }
  }

  clearCache() {
    // console.log('PersonService: Clearing cache');
    this._personData = null;
    this._fetchPromise = null; // Also clear any ongoing fetch promise if cache is explicitly cleared
  }
}

const instance = new PersonService();
// Object.freeze(instance); // REMOVED: This was causing the properties to be read-only

export default instance; 