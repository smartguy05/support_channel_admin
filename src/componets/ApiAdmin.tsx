import React, { useState, useEffect } from 'react';

const ApiAdminPage = () => {
    // Holds the list of admin chat settings
    const [settings, setSettings] = useState([]);
    // Holds form values for creating a new chat setting
    const [formData, setFormData] = useState({
        model: '',
        max_tokens: 150,
        temperature: 0.7,
        max_context_length: 4000,
        kbs: '',
        name: ''
    });
    const [error, setError] = useState('');

    // Load admin settings from the API on component mount
    useEffect(() => {
        fetch('/admin')
            .then(response => response.json())
            .then(data => setSettings(data))
            .catch(err => setError(err.message));
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Submit new chat setting to the API
    const handleSubmit = (e) => {
        e.preventDefault();

        // Convert comma-separated kbs into an array
        const payload = {
            ...formData,
            kbs: formData.kbs.split(',').map(item => item.trim()).filter(item => item !== '')
        };

        fetch('/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to add setting');
                }
                return response.json();
            })
            .then(newSetting => {
                // Append the new setting to our list
                setSettings(prev => [...prev, newSetting]);
                // Reset form fields
                setFormData({
                    model: '',
                    max_tokens: 150,
                    temperature: 0.7,
                    max_context_length: 4000,
                    kbs: '',
                    name: ''
                });
            })
            .catch(err => setError(err.message));
    };

    // Delete a chat setting by its UUID
    const handleDelete = (uuid) => {
        fetch(`/admin/${uuid}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete setting');
                }
                // Remove the setting from state
                setSettings(prev => prev.filter(s => s.uuid !== uuid));
            })
            .catch(err => setError(err.message));
    };

    return (
        <div className="admin-page" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Admin Chat Settings</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* List of existing settings */}
            <section>
                <h2>Existing Settings</h2>
                {settings.length === 0 ? (
                    <p>No chat settings available.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {settings.map(setting => (
                            <li key={setting.uuid} style={{ border: '1px solid #ccc', marginBottom: '10px', padding: '10px' }}>
                                <p><strong>Name:</strong> {setting.name}</p>
                                <p><strong>Model:</strong> {setting.model}</p>
                                <p><strong>Max Tokens:</strong> {setting.max_tokens}</p>
                                <p><strong>Temperature:</strong> {setting.temperature}</p>
                                <p><strong>Max Context Length:</strong> {setting.max_context_length}</p>
                                <p>
                                    <strong>Kbs:</strong>{' '}
                                    {Array.isArray(setting.kbs) ? setting.kbs.join(', ') : ''}
                                </p>
                                <button onClick={() => handleDelete(setting.uuid)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}>
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Form for adding a new chat setting */}
            <section style={{ marginTop: '30px' }}>
                <h2>Add New Chat Setting</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Name: <br />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                style={{ width: '300px' }}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Model: <br />
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleInputChange}
                                required
                                style={{ width: '300px' }}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Max Tokens: <br />
                            <input
                                type="number"
                                name="max_tokens"
                                value={formData.max_tokens}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100px' }}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Temperature: <br />
                            <input
                                type="number"
                                step="0.1"
                                name="temperature"
                                value={formData.temperature}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100px' }}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Max Context Length: <br />
                            <input
                                type="number"
                                name="max_context_length"
                                value={formData.max_context_length}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100px' }}
                            />
                        </label>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>
                            Kbs (comma separated): <br />
                            <input
                                type="text"
                                name="kbs"
                                value={formData.kbs}
                                onChange={handleInputChange}
                                placeholder="kb1,kb2,kb3"
                                style={{ width: '300px' }}
                            />
                        </label>
                    </div>
                    <button type="submit" style={{ padding: '8px 16px' }}>Add Chat Setting</button>
                </form>
            </section>
        </div>
    );
};

export default ApiAdminPage;
