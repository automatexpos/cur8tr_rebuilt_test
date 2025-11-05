export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export async function logout(): Promise<void> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    
    if (response.ok) {
      // Redirect to home page after logout
      window.location.href = '/';
    } else {
      console.error('Logout failed');
      // Still redirect to home even if logout fails
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Redirect to home even on error
    window.location.href = '/';
  }
}
