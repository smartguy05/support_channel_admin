import { Metric, onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // You can either directly call the functions:
    // onCLS(onPerfEntry);
    // onFID(onPerfEntry);
    // onFCP(onPerfEntry);
    // onLCP(onPerfEntry);
    // onTTFB(onPerfEntry);

    // Or if you prefer lazy-loading:
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onFID(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  
  }
};

export default reportWebVitals;
