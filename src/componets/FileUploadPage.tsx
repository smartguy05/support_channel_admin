import React, { useState } from 'react';

const FileUploadPage = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    // Handle drag events over the drop area
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle file drop
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        // Check if any files were dropped
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            const formData = new FormData();
            formData.append('file', file, file.name);

            try {
                // Perform the file upload using fetch
                const response = await fetch('http://localhost:3000/documents/wiki', {
                    method: 'POST',
                    headers: {
                        // Let the browser set the Content-Type header automatically
                        'Accept': 'application/json',
                    },
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    setUploadStatus('Upload successful!');
                    console.log('Upload result:', result);
                } else {
                    setUploadStatus('Upload failed.');
                    console.error('Upload error', response.status);
                }
            } catch (error) {
                setUploadStatus('Upload failed.');
                console.error('Upload error', error);
            }

            // Clear the files from the drag event
            e.dataTransfer.clearData();
        }
    };

    // Prevent default behavior for drag over events
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div
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
    }}
>
    <p>Drag &amp; drop a file here to upload</p>
    {uploadStatus && <p>{uploadStatus}</p>}
    </div>
    );
    };

    export default FileUploadPage;
