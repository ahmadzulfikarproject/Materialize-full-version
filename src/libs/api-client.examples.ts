/**
 * Contoh Penggunaan API Client untuk FastAPI Enterprise
 * File ini menunjukkan berbagai cara menggunakan api-client.ts
 */

/**
 * CONTOH 1: Menggunakan API di Server Component
 * File: src/app/[lang]/(dashboard)/(private)/example/server-component.tsx
 */

import { apiGet, apiPost } from '@/libs/api-client'

interface DataItem {
  id: number
  name: string
  // tambah field sesuai respons API
}

export default async function ServerComponentExample() {
  try {
    // GET request - menggunakan API_INTERNAL_BASE_URL (enterprise-api:8000)
    // isServer=true otomatis terdeteksi pada server component
    const data = await apiGet<DataItem[]>('/api/items')

    return (
      <div>
        <h1>Data dari API</h1>
        <ul>
          {data.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </div>
    )
  } catch (error) {
    return <div>Error: {String(error)}</div>
  }
}

/**
 * CONTOH 2: Menggunakan API di Client Component dengan useEffect
 * File: src/components/example/ClientComponentExample.tsx
 */

'use client'

import { apiGet } from '@/libs/api-client'
import { useEffect, useState } from 'react'

interface User {
  id: number
  email: string
  name: string
}

export function ClientComponentExample() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // isServer=false atau tidak diberikan (karena berjalan di client)
        // Akan menggunakan NEXT_PUBLIC_API_BASE_URL (localhost:8000)
        const data = await apiGet<User[]>('/api/users')
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Users</h2>
      {users.map((user) => (
        <div key={user.id}>
          <p>{user.name} - {user.email}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * CONTOH 3: POST request dengan data
 * File: src/components/example/CreateItemForm.tsx
 */

'use client'

import { apiPost } from '@/libs/api-client'
import { FormEvent } from 'react'

export function CreateItemForm() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const newItem = await apiPost('/api/items', {
        name: formData.get('name'),
        description: formData.get('description'),
      })

      console.log('Item created:', newItem)
      alert('Item berhasil dibuat!')
      e.currentTarget.reset()
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="name" placeholder="Nama item" required />
      <textarea name="description" placeholder="Deskripsi" />
      <button type="submit">Buat Item</button>
    </form>
  )
}

/**
 * CONTOH 4: Menggunakan API di API Route (Next.js)
 * File: src/app/api/proxy/items/route.ts
 */

import { apiGet } from '@/libs/api-client'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Di API Route, isServer=true (berjalan di server)
    // Akan menggunakan API_INTERNAL_BASE_URL
    const items = await apiGet('/api/items', true)
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * CONTOH 5: Custom hook untuk reusable API calls
 * File: src/hooks/useApiData.ts
 */

'use client'

import { apiGet } from '@/libs/api-client'
import { useEffect, useState } from 'react'

interface UseApiDataOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useApiData<T>(
  endpoint: string,
  options: UseApiDataOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiGet<T>(endpoint, false)
        setData(result)
        options.onSuccess?.(result)
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        options.onError?.(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [endpoint, options])

  return { data, loading, error }
}

// Penggunaan custom hook:
// export function MyComponent() {
//   const { data, loading, error } = useApiData<User[]>('/api/users')
//   if (loading) return <div>Loading...</div>
//   return <div>{data?.map(u => u.name).join(', ')}</div>
// }

/**
 * CONTOH 6: Error Handling dengan tipe yang lebih spesifik
 * File: src/utils/api-error-handler.ts
 */

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function fetchWithErrorHandling<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(response.status, response.statusText, errorData.detail || 'Unknown error')
  }

  return response.json()
}

/**
 * ENVIRONMENT VARIABLES (.env)
 * 
 * # Untuk akses dari browser (client-side)
 * NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
 * 
 * # Untuk akses dari server (server-side)
 * API_INTERNAL_BASE_URL=http://enterprise-api:8000
 */

export default function ExamplesDocumentation() {
  return null // Ini hanya file dokumentasi
}
