import React from 'react';
import PropTypes from 'prop-types';
import UseAuthCheck from '../UseAuthCheck/UseAuthCheck';

const AdminAuthorization = ({ children }) => {
  const tokenValid = UseAuthCheck('http://127.0.0.1:8000/auth/admin/protected/', '/admin/signin');

  if (!tokenValid) {
    return null;
  }
  return <>{children}</>;
};

AdminAuthorization.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AdminAuthorization;
