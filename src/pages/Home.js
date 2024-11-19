import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fetchData from '../utils/fetchData';
import '../styles/Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const listFilesUrl = 'https://starchart-988582688687.us-central1.run.app/listFiles';
  const getFileUrl = 'https://starchart-988582688687.us-central1.run.app/getFile';

  useEffect(() => {
    const fetchProfiles = async () => {
      console.log('Fetching profiles from API...');
      try {
        // Fetch list of file names
        const fileNames = await fetchData(listFilesUrl);
        console.log('Fetched file names:', fileNames);

        // Fetch profiles for each file name
        const fetchedProfiles = await Promise.all(
          fileNames.map(async (fileName) => {
            const profile = await fetchData(`${getFileUrl}?fileName=${fileName}`);
            console.log(`Fetched profile for ${fileName}:`, profile);
            return profile && profile.name ? profile : null;
          })
        );

        setProfiles(fetchedProfiles.filter(Boolean)); // Filter out invalid profiles
        console.log('Final profiles:', fetchedProfiles.filter(Boolean));
        setError(null);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError(err.message);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter((profile) =>
    profile.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  console.log('Filtered profiles:', filteredProfiles);

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div className="home">
      <header>
        <h1>Star-Themed Portfolio</h1>
        <input
          type="text"
          placeholder="Search profiles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>
      <main>
        <div className="profile-list">
          {filteredProfiles.map((profile) => (
            <div
              key={profile.name}
              className="profile-item"
              onClick={() =>
                navigate(`/portfolio/${profile.name.toLowerCase().replace(/\s+/g, '')}`)
              }
            >
              <h2>{profile.name}</h2>
              <p>{profile.about}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
