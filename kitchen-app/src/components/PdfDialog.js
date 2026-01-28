import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';

import '@react-pdf-viewer/core/lib/styles/index.css';  // Import styles




function PdfDialog({ open, onClose, directoryPath, kitchenId }) {
  //console.log("PdfDialog render:" + directoryPath);
  const [mergedPdf, setMergedPdf] = useState(null); // Stores the merged PDF Blob URL
  const [isLoading, setIsLoading] = useState(false); // Controls loading state
  const fetchAndMergePdfs = async () => {
    try {
      // Create base URL based on the current environment
      const baseURL = window.location.hostname === 'localhost'
        ? 'http://localhost'
        : `http://${window.location.hostname}`;

      const response = await fetch(`${baseURL}/api/merge-pdfs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ directoryPath: directoryPath, kitchenId: kitchenId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setMergedPdf(url);
      } else {
        console.error('Error fetching merged PDF:', await response.text());
      }
    } catch (error) {
      console.error('Error merging PDFs:', error);
    }
  };

  // Automatically trigger merge when the Dialog opens
  useEffect(() => {
    if (open) {
      fetchAndMergePdfs();
    }
  }, [open, directoryPath]);

  return (
    <Dialog open={open} onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          width: '80%', // Set width to 80% of the screen
          maxWidth: 'none', // Prevent width from being restricted
          height: '80%', // Set height to 80% of the screen
          maxHeight: 'none', // Prevent height from being restricted
        },
      }}>
      <DialogTitle>Merge PDF Files</DialogTitle>
      <DialogContent
        sx={{
          display: 'flex',
          justifyContent: 'center', // Horizontally center
          alignItems: 'center',     // Vertically center
          height: '100%',           // Ensure container fills available space
          width: '100%'             // Fill parent container width
        }}>
        {isLoading && <p>Merging files, please wait...</p>}
        {mergedPdf ? (
          <iframe
            src={mergedPdf}
            width="85%" // Width fills the Dialog content area
            height="90%" // Set height
            style={{
              transform: 'scale(1)', // Set scale (100%)
              transformOrigin: '0 0', // Set transform origin to top-left
              border: 'none',
            }}
            title="Merged PDF"
          />
        ) : (
          <p>No merge results found, please try again later.</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PdfDialog;
