import React, { useEffect } from 'react';
import { supabase } from './supabaseClient'; // Adjust path if needed

const fetchAllTableData = async (tableName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.error(`Error fetching data from ${tableName}:`, error.message);
    } else {
      console.log(`All data from ${tableName}:`, data);
      return data;
    }
  } catch (err) {
    console.error(`Unexpected error fetching data from ${tableName}:`, err);
  }
};

const DebugData = () => {
  useEffect(() => {
    console.log("--- Debugging Supabase Data ---");
    fetchAllTableData('user_footprints');
    fetchAllTableData('user_badges');
    fetchAllTableData('login_logs'); // Example for another table
    console.log("--- End Debugging Supabase Data ---");
  }, []); // Empty dependency array means it runs once on mount

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <h1>Supabase Data Debugger</h1>
      <p>Check your browser console for the fetched data.</p>
      <p>Remember to remove or comment out this component and its route when done debugging.</p>
    </div>
  );
};

export default DebugData;