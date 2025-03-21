import React, { useState, useEffect, useRef } from 'react';
import { showErrorToast, showSuccessToast } from "../helpers/ToastHelpers";
import './CollectionAdminPage.css';
import {SupportCollection} from "../models/support-collection.model";

function CollectionAdminPage() {
    const [collections, setCollections] = useState<SupportCollection[]>([]);
    const [collection, setCollection] = useState('');
    const [documents, setDocuments] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [newCollectionName, setNewCollectionName] = useState('');
    const [newCollectionDescription, setNewCollectionDescription] = useState('');
    const [addingCollection, setAddingCollection] = useState(false);
    const [showAddCollection, setShowAddCollection] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [addingApiKey, setAddingApiKey] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Fetch collections on component mount
    useEffect(() => {
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
            .then((data: SupportCollection[]) => {
                setCollections(data);
            })
            .catch((err) => {
                console.error('Error fetching collections:', err);
                showErrorToast('Failed to load collections.');
            });
    };

    // Fetch documents when the collection changes
    useEffect(() => {
        if (collection) {
            fetchDocuments(collection);
            fetchApiKeys(collection);
        } else {
            setDocuments([]);
            setApiKey(null);
        }
    }, [collection]);

    const fetchApiKeys = (collection: string) => {
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/admin/${collection}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => setApiKey(data ?? null))
            .catch(error => {
                console.error('Error fetching API keys:', error);
                showErrorToast('Failed to fetch API keys.');
            });
    }

    const fetchDocuments = (col: string) => {
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/documents/${col}`, {
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
            .then((data: string[]) => setDocuments([...data].sort((a, b) => a.localeCompare(b))))
            .catch((err) => {
                console.error('Error fetching documents:', err);
                showErrorToast('Failed to fetch documents.');
            });
    };

    const handleDeleteDocument = (filename: string) => {
        if (!collection) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete "${filename}"?`);
        if (!confirmDelete) return;

        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/documents/${collection}/${filename}`, {
            method: 'DELETE'
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Error ${res.status}: ${errorText}`);
                }
                return res.json();
            })
            .then(() => {
                showSuccessToast('File deleted successfully.');
                setDocuments((prevDocs) => prevDocs.filter((doc) => doc !== filename));
            })
            .catch((err) => {
                console.error('Error deleting document:', err);
                showErrorToast('Error deleting document.');
            });
    };

    // Handle drag events over the drop area
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const uploadFiles = async (files: FileList) => {
        if (!collection) {
            showErrorToast('Please select a collection before uploading.');
            return;
        }

        if (files.length > 20) {
            showErrorToast('You can upload a maximum of 20 files at once.');
            return;
        }

        const formData = new FormData();
        Array.from(files).forEach((file) => {
            formData.append('files', file, file.name);
        });

        setIsUploading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/documents/${collection}`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (response.ok) {
                await response.json();
                showSuccessToast('Upload successful.');
                fetchDocuments(collection);
            } else {
                const errorText = await response.text();
                showErrorToast(`Upload failed: ${errorText}`);
                console.error('Upload error', response.status, errorText);
            }
        } catch (error) {
            showErrorToast('Upload failed.');
            console.error('Upload error', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle file drop
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            await uploadFiles(files);
            e.dataTransfer.clearData();
        }
    };

    // Handle file selection via input
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFiles(files);
            e.target.value = '';
        }
    };

    // Prevent default behavior for drag over events
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleAddCollection = () => {
        if (!newCollectionName.trim()) {
            showErrorToast('Collection name is required.');
            return;
        }
        if (newCollectionDescription.length > 200) {
            showErrorToast('Description must be less than 200 characters.');
            return;
        }

        setAddingCollection(true);

        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/collections`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: newCollectionName,
                description: newCollectionDescription
            })
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Error ${res.status}: ${errorText}`);
                }
                return res.json();
            })
            .then(() => {
                showSuccessToast('Collection added successfully.');
                setNewCollectionName('');
                setNewCollectionDescription('');
                fetchCollections();
                setShowAddCollection(false);
            })
            .catch((err) => {
                console.error('Error adding collection:', err);
                showErrorToast(err.message || 'Failed to add collection.');
            })
            .finally(() => {
                setAddingCollection(false);
            });
    };

    const handleDeleteCollection = () => {
        if (!collection) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete the collection "${collection}"? This action cannot be undone.`);
        if (!confirmDelete) return;

        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/collections/${encodeURIComponent(collection)}`, {
            method: 'DELETE',
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
            .then(() => {
                showSuccessToast('Collection deleted successfully.');
                fetchCollections();
                setCollection('');
                setDocuments([]);
                setApiKey(null);
            })
            .catch((err) => {
                console.error('Error deleting collection:', err);
                showErrorToast(err.message || 'Failed to delete collection.');
            });
    };

    const handleAddApiKey = () => {
        if (!collection) {
            showErrorToast('Please select a collection first.');
            return;
        }
        setAddingApiKey(true);
        fetch(`${process.env.REACT_APP_SUPPORT_CHANNEL_KB_URL}/admin/${collection}`, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Error ${res.status}: ${errorText}`);
                }
                return res.json();
            })
            .then((data: string ) => {
                setApiKey(data);
                showSuccessToast('API key added successfully.');
            })
            .catch((err) => {
                console.error('Error adding API key:', err);
                showErrorToast(err.message || 'Failed to add API key.');
            })
            .finally(() => {
                setAddingApiKey(false);
            });
    };

    const copyToClipboard = (uuid: string) => {
        navigator.clipboard.writeText(uuid)
            .then(() => {
                alert('Collection API Key copied to clipboard!');
            })
            .catch(err => {
                alert('Failed to copy Collection API Key.');
            });
    };

    const handleUploadDivClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="collections-page">
            <h2>Collections</h2>
            <div className="collections">
                <label>
                    Collection Name:
                    <select
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        required
                        style={{ marginLeft: '10px' }}
                    >
                        <option value="">-- Select Collection --</option>
                        {collections.map((col) => (
                            <option key={col.name} value={col.name}>
                                {col.name}
                            </option>
                        ))}
                    </select>
                </label>
                <button
                    onClick={() => setShowAddCollection(true)}
                    title="Add new collection"
                    style={{
                        marginLeft: '10px',
                        padding: '5px 10px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                >
                    +
                </button>
                <button
                    onClick={handleDeleteCollection}
                    title="Delete selected collection"
                    style={{
                        marginLeft: '10px',
                        padding: '5px 10px',
                        fontSize: '16px',
                        cursor: collection ? 'pointer' : 'not-allowed',
                        backgroundColor: collection ? '#f44336' : '#ccc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                    disabled={!collection}
                >
                    Delete
                </button>
            </div>
            {showAddCollection && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Add New Collection</h3>
                    <div>
                        <label>
                            Name:
                            <input
                                type="text"
                                value={newCollectionName}
                                onChange={(e) => setNewCollectionName(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Description:
                            <textarea
                                value={newCollectionDescription}
                                onChange={(e) => setNewCollectionDescription(e.target.value)}
                                maxLength={200}
                            />
                        </label>
                    </div>
                    <button onClick={handleAddCollection} disabled={addingCollection}>
                        {addingCollection ? 'Adding...' : 'Add Collection'}
                    </button>
                </div>
            )}
            {collection && (
                <>
                    {!apiKey && (
                        <div>
                            <i>No API keys set yet</i><br/>
                            <button onClick={handleAddApiKey} disabled={addingApiKey}>
                                {addingApiKey ? 'Adding...' : 'Add API Key'}
                            </button>
                        </div>
                    )}
                    {!!apiKey && (
                        <div>
                            <h3>API Key</h3>
                            <div className="api-key">
                                <b>{apiKey}</b>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(apiKey); }}
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
                        </div>
                    )}
                    <h3>Documents in collection "{collection}"</h3>
                    <ul className="documents-list">
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <li key={doc}>
                                    {doc}
                                    <button onClick={() => handleDeleteDocument(doc)}>Delete</button>
                                </li>
                            ))
                        ) : (
                            <li>No documents found.</li>
                        )}
                    </ul>

                    <div
                        onClick={handleUploadDivClick}
                        onDragEnter={handleDrag}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        style={{
                            border: '2px dashed #aaa',
                            borderRadius: '4px',
                            padding: '20px',
                            textAlign: 'center',
                            backgroundColor: dragActive ? '#f0f8ff' : '#fff',
                            marginTop: '20px',
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                    >
                        <p>Drag &amp; drop a file here to upload or click to select files</p>
                        {uploadStatus && <p>{uploadStatus}</p>}
                        {isUploading && (
                            <div className="spinner-overlay">
                                <div className="spinner"></div>
                            </div>
                        )}
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default CollectionAdminPage;
