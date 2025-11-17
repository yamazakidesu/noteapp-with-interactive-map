import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  GUEST_STORIES: `${CONFIG.BASE_URL}/stories/guest`,
  SUBSCRIBE_PUSH: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function register({ name, email, password }) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to register');
  }
  return result;
}

export async function login({ email, password }) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to login');
  }
  return result;
}

export async function getStories({ page = 1, size = 10, location = 0 } = {}) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    location: location.toString(),
  });
  const url = `${ENDPOINTS.STORIES}?${params}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, {
    headers,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch stories');
  }
  return result;
}

export async function getStoryDetail(id) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${ENDPOINTS.STORIES}/${id}`, {
    headers,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to fetch story detail');
  }
  return result;
}

export async function addStory(formData) {
  const token = localStorage.getItem('token') || CONFIG.TOKEN;
  const response = await fetch(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to add story');
  }
  return result;
}

export async function addStoryGuest(formData) {
  const response = await fetch(ENDPOINTS.GUEST_STORIES, {
    method: 'POST',
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to add story as guest');
  }
  return result;
}

export async function subscribePush(subscription) {
  const token = localStorage.getItem('token') || CONFIG.TOKEN;
  const response = await fetch(ENDPOINTS.SUBSCRIBE_PUSH, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subscription),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to subscribe push');
  }
  return result;
}

export async function unsubscribePush(endpoint) {
  const token = localStorage.getItem('token') || CONFIG.TOKEN;
  const response = await fetch(ENDPOINTS.SUBSCRIBE_PUSH, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ endpoint }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to unsubscribe push');
  }
  return result;
}
