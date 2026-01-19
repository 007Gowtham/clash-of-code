import React from 'react';

export const metadata = {
  title: 'Authentication | LT App',
  description: 'Sign in or create an account',
};

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      {children}
    </div>
  );
};

export default AuthLayout;
