import React, {useState, useEffect} from 'react';
import ChatWindow from './ChatWindow';
import {ChannelConfig} from "../models/channel-config.model";
import {showErrorToast} from "../helpers/ToastHelpers"; // Adjust the import path as necessary

const ChannelAdminPage = () => {
    const [collections, setCollections] = useState<string[]>([]);
    const [settings, setSettings] = useState<ChannelConfig[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        model: '',
        max_tokens: 150,
        temperature: 0.7,
        max_context_length: 4000,
        system_prompt: '',
        initial_message: '',
        kbs: [] // [{ api_key: '', collection: '' }]
    });
    const [error, setError] = useState('');
    const [selectedChannelUuid, setSelectedChannelUuid] = useState<string | null>(null);

    // New state for editing mode
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingData, setEditingData] = useState<any>(null);
    
    const [showAddChannel, setShowAddChannel] = useState<boolean>(false);
    
    useEffect(() => {
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_API_URL}/admin`)
            .then(response => response.json())
            .then(data => setSettings(data.map(m => new ChannelConfig(m))))
            .catch(err => setError(err.message));
        fetchCollections();
    }, []);

    const fetchCollections = () => {
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/collections`, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Error ${res.status}: ${errorText}`);
                }
                return res.json();
            })
            .then((data: string[]) => {
                setCollections(data);
            })
            .catch((err) => {
                console.error('Error fetching collections:', err);
                showErrorToast('Failed to load collections.');
            });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addKBCollection = () => {
        setFormData(prev => ({
            ...prev,
            kbs: [...prev.kbs, { api_key: '', collection: '' }]
        }));
    };

    const removeKBChannel = (index: number) => {
        setFormData(prev => {
            const newKbs = [...prev.kbs];
            newKbs.splice(index, 1);
            return { ...prev, kbs: newKbs };
        });
    };

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            model: formData.model,
            max_tokens: Number(formData.max_tokens),
            temperature: Number(formData.temperature),
            max_context_length: Number(formData.max_context_length),
            system_prompt: formData.system_prompt,
            kbs: formData.kbs
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
                setSettings(prev => [...prev, newSetting]);
                setShowAddChannel(false);
                setFormData({
                    name: '',
                    model: '',
                    system_prompt: '',
                    initial_message: '',
                    max_tokens: 150,
                    temperature: 0.7,
                    max_context_length: 4000,
                    kbs: []
                });
            })
            .catch(err => setError(err.message));
    };

    const handleDelete = (uuid: string) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this setting?');
        if (!confirmDelete) return;
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_API_URL}/admin/${uuid}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete setting');
                }
                setSettings(prev => prev.filter((s: any) => s.uuid !== uuid));
            })
            .catch(err => setError(err.message));
    };

    const handleChannelClick = (setting) => {
        if (!!editingId) {
            setSelectedChannelUuid(null); 
        } else {
            setSelectedChannelUuid(setting.uuid);
        }
    };

    const handleCloseChatWindow = () => {
        setSelectedChannelUuid(null);
    };

    // EDITING RELATED FUNCTIONS

    // Trigger edit mode for a specific setting
    const handleEditClick = (e: React.MouseEvent, setting: any) => {
        e.stopPropagation();
        setEditingId(setting.uuid);
        setEditingData({ ...setting });
    };

    // Update field for editing data
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditingData((prev: any) => ({ ...prev, [name]: value }));
    };

    // Update kb channel for editing data
    const updateEditKBChannel = (index: number, field: string, value: string) => {
        setEditingData((prev: any) => {
            const newKbs = prev.kbs.map((kb: any, idx: number) => {
                if (idx === index) {
                    return { ...kb, [field]: value };
                }
                return kb;
            });
            return { ...prev, kbs: newKbs };
        });
    };

    // Add a KB collection for editing data
    const addEditKBCollection = () => {
        setEditingData((prev: any) => ({
            ...prev,
            kbs: [...prev.kbs, { api_key: '', collection: '' }]
        }));
    };

    // Remove a KB channel for editing data
    const removeEditKBChannel = (index: number) => {
        setEditingData((prev: any) => {
            const newKbs = [...prev.kbs];
            newKbs.splice(index, 1);
            return { ...prev, kbs: newKbs };
        });
    };

    // Cancel editing
    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
        setEditingData(null);
    };

    // Save edited setting
    const handleSaveEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        const payload = {
            name: editingData.name,
            model: editingData.model,
            max_tokens: Number(editingData.max_tokens),
            temperature: Number(editingData.temperature),
            max_context_length: Number(editingData.max_context_length),
            system_prompt: editingData.system_prompt,
            initial_message: editingData.initial_message,
            kbs: editingData.kbs
        };
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_API_URL}/admin/${editingData.uuid}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'accept': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update setting');
                }
                return response.json();
            })
            .then(updatedSetting => {
                setSettings(prev =>
                    prev.map(s => (s.uuid === updatedSetting.uuid ? updatedSetting : s))
                );
                setEditingId(null);
                setEditingData(null);
            })
            .catch(err => setError(err.message));
    };
    
    const handleAddChannel = () => {
        setShowAddChannel(true);
    }

    const handleCloseAddChannel = () => {
        setShowAddChannel(false);
    }

    // Function to copy UUID to clipboard
    const copyToClipboard = (uuid: string) => {
        navigator.clipboard.writeText(uuid)
            .then(() => {
                alert('Channel ID copied to clipboard!');
            })
            .catch(err => {
                alert('Failed to copy Channel ID.');
            });
    };
    
    const handleCollectionSelected = (index, e) => {
        updateEditKBChannel(index, 'collection', e.target.value);
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/admin/${e.target.value}`)
            .then(response => response.json())
            .then(data => updateEditKBChannel(index, 'api_key', data))
            .catch(err => setError(err.message));
    };

    return (
        <div className="admin-page" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Channel Settings</h1>
            <button 
                style={{
                    padding: '5px 10px',
                    cursor: 'pointer',
                    backgroundColor: '#1EA54CFF',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px'
                }} 
                onClick={handleAddChannel}
            >
                Add New Channel
            </button>
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
                                onClick={() => handleChannelClick(setting)}
                                style={{
                                    border: '1px solid #ccc',
                                    marginBottom: '10px',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    backgroundColor: selectedChannelUuid === setting.uuid ? '#f0f0f0' : '#fff'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <p style={{ margin: 0, marginRight: '10px' }}>
                                        <strong>Channel Id:</strong> {setting.uuid}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); copyToClipboard(setting.uuid); }}
                                        style={{
                                            padding: '5px 10px',
                                            cursor: 'pointer',
                                            backgroundColor: '#007BFF',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Copy
                                    </button>
                                </div>
                                {editingId === setting.uuid && editingData ? (
                                    <div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <label>
                                                Name: <br />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editingData.name}
                                                    onChange={handleEditChange}
                                                    style={{ width: '300px' }}
                                                />
                                            </label>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <label>
                                                Model: <br />
                                                <input
                                                    type="text"
                                                    name="model"
                                                    value={editingData.model}
                                                    onChange={handleEditChange}
                                                    style={{ width: '300px' }}
                                                />
                                            </label>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <label>
                                                System Prompt: <br />
                                                <textarea
                                                    name="system_prompt"
                                                    value={editingData.system_prompt}
                                                    onChange={handleEditChange}
                                                    style={{ width: '300px' }}
                                                />
                                            </label>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <label>
                                                Initial Message: <br />
                                                <textarea
                                                    name="initial_message"
                                                    value={editingData.initial_message}
                                                    onChange={handleEditChange}
                                                    style={{ width: '300px' }}
                                                />
                                            </label>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <label>
                                                Max Tokens: <br />
                                                <input
                                                    type="number"
                                                    name="max_tokens"
                                                    value={editingData.max_tokens}
                                                    onChange={handleEditChange}
                                                    style={{ width: '100px' }}
                                                />
                                            </label>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <label>
                                                Temperature: <br />
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    name="temperature"
                                                    value={editingData.temperature}
                                                    onChange={handleEditChange}
                                                    style={{ width: '100px' }}
                                                />
                                            </label>
                                        </div>
                                        <div style={{ marginBottom: '5px' }}>
                                            <label>
                                                Max Context Length: <br />
                                                <input
                                                    type="number"
                                                    name="max_context_length"
                                                    value={editingData.max_context_length}
                                                    onChange={handleEditChange}
                                                    style={{ width: '100px' }}
                                                />
                                            </label>
                                        </div>
                                        {/* KB Collections Editing */}
                                        <div style={{ marginBottom: '5px' }}>
                                            <h3>KB Collections</h3>
                                            <button type="button" onClick={addEditKBCollection} style={{ marginBottom: '10px' }}>
                                                Add KB Collection
                                            </button>
                                            {editingData.kbs?.map((kb: any, index: number) => (
                                                <div key={index} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd' }}>
                                                    {(!kb.collection || !kb.api_key) && (
                                                        <div style={{marginBottom: '5px'}}>
                                                            <label>
                                                                Collection Name:
                                                                <select
                                                                    value={kb}
                                                                    onChange={(e) => handleCollectionSelected(index, e)}
                                                                    required
                                                                    style={{marginLeft: '10px'}}
                                                                >
                                                                    <option value="">-- Select Collection --</option>
                                                                    {collections.map((col) => (
                                                                        <option key={col} value={col}>
                                                                            {col}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </label>
                                                        </div>
                                                    )}
                                                    <div style={{ marginBottom: '5px' }}>
                                                        <label>
                                                            Collection: <br />
                                                            <label>{kb.collection}</label>
                                                        </label>
                                                    </div>
                                                    <div style={{ marginBottom: '5px' }}>
                                                        <label>
                                                            API Key: <br />
                                                            <label>{kb.api_key}</label>
                                                        </label>
                                                    </div>
                                                    <button type="button" onClick={() => removeEditKBChannel(index)} style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={handleSaveEdit} style={{ padding: '5px 10px', marginRight: '5px' }}>Save</button>
                                        <button onClick={handleCancelEdit} style={{ padding: '5px 10px' }}>Cancel</button>
                                    </div>
                                ) : (
                                    <div>
                                        <p><strong>Name:</strong> {setting.name}</p>
                                        <p><strong>Model:</strong> {setting.model}</p>
                                        <p><strong>System Prompt:</strong> {setting.system_prompt}</p>
                                        <p><strong>Initial Message:</strong> {setting.initial_message}</p>
                                        <p><strong>Max Tokens:</strong> {setting.max_tokens}</p>
                                        <p><strong>Temperature:</strong> {setting.temperature}</p>
                                        <p><strong>Max Context Length:</strong> {setting.max_context_length}</p>
                                        <p>
                                            <strong>Kbs:</strong>{' '}<br/>
                                            {Array.isArray(setting.kbs)
                                                ? setting.kbs.map((kb: any) => `Collection: ${kb.collection}, API Key: ${kb.api_key}`).join(' | ')
                                                : ''}
                                        </p>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditClick(e, setting); }}
                                            style={{ marginRight: '5px', padding: '5px 10px' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(setting.uuid); }}
                                            style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Form for adding a new chat setting */}
            {showAddChannel && (
                <section style={{ position: 'absolute', top: '10vh', backgroundColor: '#fff', left: '50%', transform: 'translate(-50%)', width: '70vw', border: '1px solid #000', paddingBottom: '2vh' }}>
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
                                Initial Message: <br />
                                <textarea
                                    name="initial_message"
                                    value={formData.initial_message}
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

                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                            <button type="submit" style={{ padding: '8px 16px' }}>Add Channel</button>
                            <button type="button" style={{ padding: '8px 16px' }} onClick={handleCloseAddChannel}>Cancel</button>
                        </div>
                    </form>
                </section>    
            )}

            {/* Conditionally render ChatWindow */}
            {selectedChannelUuid && (
                <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
                    <ChatWindow uuid={selectedChannelUuid} onClose={handleCloseChatWindow} initialMessage={settings.find(f => f.uuid === selectedChannelUuid).initial_message ?? ''} />
                </div>
            )}
        </div>
    );
};

export default ChannelAdminPage;
