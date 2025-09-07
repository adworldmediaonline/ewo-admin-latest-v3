'use client';
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Wrapper from '@/layout/wrapper';
import { useGetUserByIdQuery } from '@/redux/user/userApi';
import Link from 'next/link';

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading, isError } = useGetUserByIdQuery(id);
  const user = data?.data;

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }
  if (isError || !user) {
    return <div className="p-8 text-red-600">User not found.</div>;
  }

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100 min-h-screen flex flex-col items-center">
        <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 mb-4">
            {user.imageURL ? (
              <img
                src={user.imageURL}
                alt={user.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="text-3xl font-semibold">{user.name}</div>
          <div className="text-lg text-gray-500">{user.email}</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-base font-medium">
              {user.role}
            </span>
            <span
              className={`px-3 py-1 rounded text-base font-medium ${
                user.status === 'active'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {user.status}
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <div className="mt-4 w-full">
            <div className="grid grid-cols-1 gap-2 text-base text-gray-700">
              <div>
                <span className="font-medium">Phone:</span> {user.phone || '—'}
              </div>
              <div>
                <span className="font-medium">Address:</span>{' '}
                {user.address || '—'}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{' '}
                {new Date(user.updatedAt).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Joined:</span>{' '}
                <span className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
          >
            Back to Users
          </button>
        </div>
      </div>
    </Wrapper>
  );
}
