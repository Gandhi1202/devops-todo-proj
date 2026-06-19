import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);  // Add state to hold user data

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')); // Get user data from localStorage
    if (storedUser) {
      setUser(storedUser);  // Set the user data in state
    } else {
      navigate('/login'); // Redirect to login if no user data is found
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    navigate('/login');  // Redirect to login after logout
  };

  if (!user) {
    return <div>Loading...</div>;  // Display loading while user data is being fetched
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg p-4">
            <h2 className="text-center mb-4">User Profile</h2>
            <div className="mb-3">
              <strong>Name:</strong> <span>{user.name}</span>
            </div>
            <div className="mb-3">
              <strong>Email:</strong> <span>{user.email}</span>
            </div>
            <div className="mb-3">
              <strong>Contact:</strong> <span>{user.contact}</span>
            </div>
            <h4>Your Projects:</h4>
            <ul className="list-group mb-3">
              {user.projects && user.projects.map(project => (
                <li key={project.id} className="list-group-item">
                  {project.name}
                </li>
              ))}
            </ul>
            <h4>Your Tasks:</h4>
            <ul className="list-group">
              {user.tasks && user.tasks.map(task => (
                <li key={task.id} className="list-group-item">
                  {task.name} - Status: {task.status}
                </li>
              ))}
            </ul>
            <button
              onClick={handleLogout}
              className="btn btn-danger w-100 mt-3"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
