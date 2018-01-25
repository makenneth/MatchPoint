import React from 'react';
import { Link } from 'react-router';

const ErrorPage = () => (
  (<div>
    <h1>404 NOT FOUND</h1>
    <Link to="/" style={{ color: 'black' }}>Back to Main Page</Link>
  </div>)
);

export default ErrorPage;
