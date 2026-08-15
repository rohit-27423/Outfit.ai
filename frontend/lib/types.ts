export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  is_verified: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}
