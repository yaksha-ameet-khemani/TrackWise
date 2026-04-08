export interface Profile {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  created_at: string
}
