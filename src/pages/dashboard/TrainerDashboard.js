import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function TrainerDashboard() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [newExercise, setNewExercise] = useState({
    id: '', title: '', description: '', difficulty: 'Beginner', tags: ''
  });

  const token = localStorage.getItem('token');

  // 1. Fetch current exercises on load
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await axios.get('http://localhost:8000/trainer/learning-paths/exercises', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setExercises(res.data);
    } catch (err) {
      toast.error("Failed to load exercises.");
    }
  };

  // 2. Handle adding a new exercise
  const handleAddExercise = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Format tags from comma-separated string to array for the Pydantic schema
    const payload = {
      ...newExercise,
      id: parseInt(newExercise.id),
      tags: newExercise.tags.split(',').map(tag => tag.trim())
    };

    try {
      await axios.post('http://localhost:8000/trainer/exercises/add', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Exercise added to data.json!");
      setNewExercise({ id: '', title: '', description: '', difficulty: 'Beginner', tags: '' });
      fetchExercises(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error adding exercise");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Toaster />
      <h1>Trainer Curriculum Manager</h1>
      
      {/* Form Section */}
      <div style={styles.card}>
        <h3>Add New Exercise Card</h3>
        <form onSubmit={handleAddExercise} style={styles.form}>
          <input type="number" placeholder="ID (e.g. 1)" value={newExercise.id} onChange={e => setNewExercise({...newExercise, id: e.target.value})} required style={styles.input}/>
          <input type="text" placeholder="Title" value={newExercise.title} onChange={e => setNewExercise({...newExercise, title: e.target.value})} required style={styles.input}/>
          <textarea placeholder="Description / Question" value={newExercise.description} onChange={e => setNewExercise({...newExercise, description: e.target.value})} required style={styles.textarea}/>
          <select value={newExercise.difficulty} onChange={e => setNewExercise({...newExercise, difficulty: e.target.value})} style={styles.input}>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <input type="text" placeholder="Tags (comma separated: loop, array)" value={newExercise.tags} onChange={e => setNewExercise({...newExercise, tags: e.target.value})} style={styles.input}/>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Saving...' : 'Add Exercise'}
          </button>
        </form>
      </div>

      {/* List Section */}
      <div style={styles.listSection}>
        <h3>Current Exercises in data.json</h3>
        {exercises.length === 0 ? <p>No exercises found.</p> : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map(ex => (
                <tr key={ex.id}>
                  <td>{ex.id}</td>
                  <td>{ex.title}</td>
                  <td>{ex.difficulty}</td>
                  <td>{ex.tags.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' },
  card: { background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ddd' },
  textarea: { padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px' },
  button: { background: '#3182ce', color: '#fff', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  listSection: { marginTop: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: '#fff' },
};