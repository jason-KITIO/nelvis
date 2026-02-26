let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (response.status === 401 && !url.includes('/auth/refresh') && !url.includes('/auth/login')) {
    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          isRefreshing = false;
          onRefreshed('refreshed');
          
          // Retry original request
          return fetch(url, {
            ...options,
            credentials: 'include',
          });
        } else {
          // Refresh failed, redirect to login
          isRefreshing = false;
          window.location.href = '/login';
          throw new Error('Session expirée');
        }
      } catch (error) {
        isRefreshing = false;
        window.location.href = '/login';
        throw error;
      }
    } else {
      // Wait for refresh to complete
      return new Promise((resolve) => {
        addRefreshSubscriber(() => {
          resolve(fetch(url, {
            ...options,
            credentials: 'include',
          }));
        });
      });
    }
  }

  return response;
}
