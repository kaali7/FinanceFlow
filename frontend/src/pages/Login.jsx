import React from 'react';

const Login = () => {
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <div className="bg-white p-8 rounded shadow-md w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome</h2>
        <p className="mb-4 text-gray-600">Please log in to manage your finances.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
          Login (Mock)
        </button>
      </div>
    </div>
  );
};

export default Login;
