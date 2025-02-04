import React, { useState, useEffect } from 'react';

function KbAdminPage() {
    const [collection, setCollection] = useState('');
    const [documents, setDocuments] = useState([]);
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');

    // Fetch documents when the collection changes
    useEffect(() => {
        if (collection) {
            fetch(`/documents/${collection}`)
                .then((res) => res.json())
                .then((data) => setDocuments(data))
                .catch((err) => console.error('Error fetching documents:', err));
        }
    }, [collection]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!collection || !file) {
            setMessage('Please specify a collection and select a file.');
            return;
        }
        const formData = new FormData();
        formData.append('file', file);

        fetch(`/documents/${collection}`, {
            method: 'POST',
            body: formData
        })
            .then((res) => res.json())
            .then((data) => {
                setMessage('File uploaded successfully.');
                // Refresh the list of documents
                return fetch(`/documents/${collection}`);
            })
            .then((res) => res.json())
            .then((data) => setDocuments(data))
            .catch((err) => {
                console.error('Error uploading file:', err);
                setMessage('Error uploading file.');
            });
    };

    const handleDelete = (filename) => {
        if (!collection) return;
        fetch(`/documents/${collection}/${filename}`, {
            method: 'DELETE'
        })
            .then((res) => res.json())
            .then(() => {
                setMessage(`Deleted ${filename}`);
                // Refresh documents list
                setDocuments((prevDocs) => prevDocs.filter((doc) => doc.filename !== filename));
            })
            .catch((err) => {
                console.error('Error deleting document:', err);
                setMessage('Error deleting document.');
            });
    };

    return (
        <div>
            <h2>Documents</h2>
            <form onSubmit={handleUpload}>
                <div>
                    <label>
                        Collection Name:
                        <input
                            type="text"
                            value={collection}
                            onChange={(e) => setCollection(e.target.value)}
                            placeholder="Enter collection name"
                            required
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Upload File:
                        <input type="file" onChange={handleFileChange} required />
                    </label>
                </div>
                <button type="submit">Upload Document</button>
            </form>
            {message && <p>{message}</p>}
            {collection && (
                <>
                    <h3>Documents in {collection}</h3>
                    <ul>
                        {documents.length > 0 ? (
                            documents.map((doc) => (
                                <li key={doc.filename}>
                                    {doc.filename}{' '}
                                    <button onClick={() => handleDelete(doc.filename)}>Delete</button>
                                </li>
                            ))
                        ) : (
                            <li>No documents found.</li>
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default KbAdminPage;
