import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

class ImageService {
  _imageDataCache = {}; // Cache for storing image data { personId: data }
  _fetchPromisesCache = {}; // Cache for storing ongoing fetch promises { personId: promise }

  constructor() {
    if (!ImageService.instance) {
      ImageService.instance = this;
    }
    return ImageService.instance;
  }

  async getImageByPersonId(personId, token) {
    if (!API_URL) {
      console.error('ImageService: API_URL is not configured.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('ImageService: Token is required to fetch image.');
      return Promise.reject(new Error('Token is required.'));
    }
    if (!personId) {
      console.error('ImageService: personId is required to fetch image.');
      return Promise.reject(new Error('personId is required.'));
    }

    if (this._imageDataCache[personId]) {
      // console.log('ImageService: Returning cached image data for personId:', personId);
      return Promise.resolve(this._imageDataCache[personId]);
    }

    if (this._fetchPromisesCache[personId]) {
      // console.log('ImageService: Fetch in progress for personId:', personId, ', returning existing promise');
      return this._fetchPromisesCache[personId];
    }

    // console.log('ImageService: Initiating new fetch for /api/image/', personId);
    this._fetchPromisesCache[personId] = axios.get(`${API_URL}/api/image/${personId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob' // Expect the response data to be a Blob
    })
    .then(response => {
      this._imageDataCache[personId] = response.data; // Cache the Blob
      // console.log('ImageService: Image data (blob) fetched and cached for personId:', personId);
      delete this._fetchPromisesCache[personId]; // Clear promise once resolved
      return this._imageDataCache[personId]; // Return the Blob
    })
    .catch(error => {
      // console.error('ImageService: Error fetching image data for personId:', personId, error);
      delete this._fetchPromisesCache[personId]; // Clear promise on error too
      throw error; // Re-throw so the calling component can handle it
    });

    return this._fetchPromisesCache[personId];
  }

  async addImage(file, token) {
    if (!API_URL) {
      console.error('ImageService: API_URL is not configured for addImage.');
      return Promise.reject(new Error('API_URL is not configured.'));
    }
    if (!token) {
      console.error('ImageService: Token is required to add image.');
      return Promise.reject(new Error('Token is required for image upload.'));
    }
    if (!file) {
      console.error('ImageService: File data is required to add image.');
      return Promise.reject(new Error('File data is required.'));
    }

    const formData = new FormData();
    formData.append('file', file);

    // console.log('ImageService: Attempting to upload image...');
    try {
      const response = await axios.post(`${API_URL}/api/image/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Axios will typically set 'Content-Type': 'multipart/form-data' automatically
          // when posting FormData.
        },
      });
      // console.log('ImageService: Image uploaded successfully.', response.data);
      // Note: Cache invalidation for a specific personId is not done here as personId is not
      // a parameter for this endpoint. If a global image cache refresh is needed after
      // any image upload, clearAllCache() could be called.
      return response.data;
    } catch (error) {
      // console.error('ImageService: Error uploading image', error);
      // The error might contain details if the person does not exist,
      // as per the user's requirement. Re-throw for component handling.
      throw error;
    }
  }

  clearCacheForPerson(personId) {
    if (personId) {
      // console.log('ImageService: Clearing image cache for personId:', personId);
      delete this._imageDataCache[personId];
      // If there's an ongoing fetch for this personId, it will complete and re-cache
      // or error out. If we want to cancel it, we'd need AbortController, which is more complex.
    }
  }

  clearAllCache() {
    // console.log('ImageService: Clearing all cached image data');
    this._imageDataCache = {};
    // this._fetchPromisesCache = {}; // Optionally clear ongoing fetches too, though they might error if component expects data
  }
}

const instance = new ImageService();
export default instance; 