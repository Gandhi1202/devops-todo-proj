import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserDetails = () => {
    const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://localhost:8080/user/details', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUserDetails(response.data);
            } catch (error) {
                console.error(error);
                alert('Error fetching user details');
            }
        };

        fetchUserDetails();
    }, []);

    return (
        <div>
            <h1>User Details</h1>
            {userDetails ? (
                <div>
                    <p>Name: {userDetails.user.name}</p>
                    <p>Email: {userDetails.user.email}</p>
                    {/* Add more user details as needed */}
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default UserDetails;
