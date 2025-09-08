'use client';
import React from 'react';
import Link from 'next/link';
import Wrapper from '@/layout/wrapper';
import Breadcrumb from '../components/breadcrumb/breadcrumb';
import { useGetUsersQuery } from '@/redux/user/userApi';

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

export default function UsersPage() {
  const { data, isLoading, isError } = useGetUsersQuery();
  const users = data?.data || [];

  return (
    <Wrapper>
      <div className="body-content px-8 py-8 bg-slate-100 min-h-screen">
        <Breadcrumb title="Users" subtitle="User List" />
        <div className="max-w-5xl mx-auto mt-8">
          {isLoading && <div>Loading...</div>}
          {isError && <div className="text-red-600">Failed to load users.</div>}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {users.map((user: any) => (
                <div
                  key={user._id}
                  className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600 mb-4">
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
                  <div className="text-lg font-semibold">{user.name}</div>
                  <div className="text-gray-500 text-sm">{user.email}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                      {user.role}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <Link
                    href={`/users/${user._id}`}
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
