import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow'; // Adjust the import path as necessary

const ChannelAdminPage = () => {
    // Holds the list of admin chat settings
    const [settings, setSettings] = useState([]);
    // Holds form values for creating a new chat setting
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        max_tokens: 150,
        temperature: 0.7,
        max_context_length: 4000,
        system_prompt: '',
        kbs: [] // This will be an array of objects: { api_key: '', collection: '' }
    });
    const [error, setError] = useState('');
    // State to track selected channel UUID
    const [selectedChannelUuid, setSelectedChannelUuid] = useState<string | null>(null);

    // Load admin settings from the API on component mount
    useEffect(() => {
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_API_URL}/admin`)
            .then(response => response.json())
            .then(data => setSettings(data))
            .catch(err => setError(err.message));
    }, []);

    // Handle form input changes for top-level fields
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Add a new KB Channel entry
    const addKBCollection = () => {
        setFormData(prev => ({
            ...prev,
            kbs: [...prev.kbs, { api_key: '', collection: '' }]
        }));
    };

    // Remove a KB Channel entry at a given index
    const removeKBChannel = (index: number) => {
        setFormData(prev => {
            const newKbs = [...prev.kbs];
            newKbs.splice(index, 1);
            return { ...prev, kbs: newKbs };
        });
    };

    // Update a field in a specific KB Channel entry
    const updateKBChannel = (index: number, field: string, value: string) => {
        setFormData(prev => {
            const newKbs = prev.kbs.map((kb, idx) => {
                if (idx === index) {
                    return { ...kb, [field]: value };
                }
                return kb;
            });
            return { ...prev, kbs: newKbs };
        });
    };

    // Submit new chat setting to the API
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare payload with proper types and structure.
        const payload = {
            name: formData.name,
            model: formData.model,
            max_tokens: Number(formData.max_tokens),
            temperature: Number(formData.temperature),
            max_context_length: Number(formData.max_context_length),
            system_prompt: formData.system_prompt,
            kbs: formData.kbs // Each object should have the properties: api_key and collection
        };

        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_API_URL}/admin`, {
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
                    name: '',
                    model: '',
                    system_prompt: '',
                    max_tokens: 150,
                    temperature: 0.7,
                    max_context_length: 4000,
                    kbs: []
                });
            })
            .catch(err => setError(err.message));
    };

    // Delete a chat setting by its UUID with confirmation
    const handleDelete = (uuid: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this setting?');
        if (!confirmDelete) return;

        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_API_URL}/admin/${uuid}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete setting');
                }
                // Remove the setting from state
                setSettings(prev => prev.filter((s: any) => s.uuid !== uuid));
            })
            .catch(err => setError(err.message));
    };

    // Handle channel click to open ChatWindow
    const handleChannelClick = (uuid: string) => {
        setSelectedChannelUuid(uuid);
    };

    // Handle closing the ChatWindow
    const handleCloseChatWindow = () => {
        setSelectedChannelUuid(null);
    };

    return (
        <div className="admin-page" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Channel Settings</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* List of existing settings */}
            <section>
                {settings.length === 0 ? (
                    <p>No chat settings available.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {settings.filter((f: any) => !!f.uuid).map((setting: any) => (
                            <li
                                key={setting.uuid}
                                onClick={() => handleChannelClick(setting.uuid)}
                                style={{
                                    border: '1px solid #ccc',
                                    marginBottom: '10px',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedChannelUuid === setting.uuid ? '#f0f0f0' : '#fff'
                                }}
                            >
                                <p><strong>Name:</strong> {setting.name}</p>
                                <p><strong>Model:</strong> {setting.model}</p>
                                <p><strong>Max Tokens:</strong> {setting.max_tokens}</p>
                                <p><strong>Temperature:</strong> {setting.temperature}</p>
                                <p><strong>Max Context Length:</strong> {setting.max_context_length}</p>
                                <p>
                                    <strong>Kbs:</strong>{' '}
                                    {Array.isArray(setting.kbs)
                                        ? setting.kbs
                                            .map((kb: any) => `Collection: ${kb.collection}, API Key: ${kb.api_key}`)
                                            .join(' | ')
                                        : ''}
                                </p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(setting.uuid); }}
                                    style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Form for adding a new chat setting */}
            <section style={{ marginTop: '30px' }}>
                <h2>Add New Channel</h2>
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
                            System Prompt: <br />
                            <textarea
                                name="system_prompt"
                                value={formData.system_prompt}
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

                    {/* KB Collections Section */}
                    <div style={{ marginBottom: '10px' }}>
                        <h3>KB Collections</h3>
                        <button type="button" onClick={addKBCollection} style={{ marginBottom: '10px' }}>
                            Add KB Collection
                        </button>
                        {formData.kbs.map((kb, index) => (
                            <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
                                <div style={{ marginBottom: '5px' }}>
                                    <label>
                                        Collection: <br />
                                        <input
                                            type="text"
                                            value={kb.collection}
                                            onChange={(e) => updateKBChannel(index, 'collection', e.target.value)}
                                            required
                                            style={{ width: '250px' }}
                                        />
                                    </label>
                                </div>
                                <div style={{ marginBottom: '5px' }}>
                                    <label>
                                        API Key: <br />
                                        <input
                                            type="text"
                                            value={kb.api_key}
                                            onChange={(e) => updateKBChannel(index, 'api_key', e.target.value)}
                                            required
                                            style={{ width: '250px' }}
                                        />
                                    </label>
                                </div>
                                <button type="button" onClick={() => removeKBChannel(index)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}>
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={{ padding: '8px 16px' }}>Add Channel</button>
                </form>
            </section>

            {/* Conditionally render ChatWindow */}
            {selectedChannelUuid && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                    <ChatWindow uuid={selectedChannelUuid} onClose={handleCloseChatWindow} />
                </div>
            )}
        </div>
    );
};

export default ChannelAdminPage;
