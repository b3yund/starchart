import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import fetchData from '../utils/fetchData';
import { AuthContext } from '../AuthContext';
import PasswordPrompt from '../components/PasswordPrompt';
import BackgroundVideo from '../components/BackgroundVideo';
import '../styles/Everything.css';

const Everything = () => {
  const { name } = useParams();
  const { isAuthenticated, passwordEntered } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editableProfile, setEditableProfile] = useState(''); // Editable JSON content
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const getFileUrl = name
    ? `https://starchart-988582688687.us-central1.run.app/getFile?fileName=${name}.json`
    : null;
  const saveFileUrl = `https://starchart-988582688687.us-central1.run.app/editFile`;

  useEffect(() => {
    if ((isAuthenticated || passwordEntered) && name) {
      const fetchProfile = async () => {
        try {
          const data = await fetchData(getFileUrl);
          setProfile(data);
          setEditableProfile(JSON.stringify(data, null, 2)); // Format JSON for editing
          setError(null);
        } catch (err) {
          console.error('Error fetching profile:', err);
          setError(err.message);
        }
      };

      fetchProfile();
    }
  }, [isAuthenticated, passwordEntered, name, getFileUrl]);

  const handleSaveChanges = async () => {
    try {
      // Validate JSON before sending to the server
      const updatedProfile = JSON.parse(editableProfile);

      const edits = Object.keys(updatedProfile).map((key) => ({
        action: 'edit',
        key,
        value: updatedProfile[key],
      }));

      const response = await fetch(saveFileUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `${name}.json`,
          edits,
        }),
      });

      if (!response.ok) throw new Error('Failed to save changes');

      setProfile(updatedProfile); // Update local state
      setMessage('Changes saved successfully!');
      setError(null);
    } catch (err) {
      console.error('Error saving changes:', err);
      setError('Failed to save changes. Please ensure the JSON is valid.');
      setMessage('');
    }
  };

  if (!isAuthenticated && !passwordEntered) {
    return <PasswordPrompt onAuthenticated={() => {}} />;
  }

  if (error) {
    return (
      <div className="everything">
        <BackgroundVideo />
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (!profile && name) {
    return (
      <div className="everything">
        <BackgroundVideo />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="everything">
      <BackgroundVideo />
      <div className="content">
        <h1>{name ? `Everything: ${name}` : 'Everything'}</h1>
        {profile ? (
          <>
            <textarea
              className="json-editor"
              value={editableProfile}
              onChange={(e) => setEditableProfile(e.target.value)}
              rows="20"
              cols="80"
            />
            <button className="save-button" onClick={handleSaveChanges}>
              Save Changes
            </button>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
          </>
        ) : (
          <p>No specific profile selected. Access the global data or search for a profile.</p>
        )}
      </div>
    </div>
  );
};

export default Everything;
