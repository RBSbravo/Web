import { useState, useCallback, useRef } from 'react';

// Optimized state hook that prevents unnecessary re-renders
export const useOptimizedState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setOptimizedState = useCallback((newValue) => {
    if (typeof newValue === 'function') {
      const computedValue = newValue(stateRef.current);
      if (computedValue !== stateRef.current) {
        setState(computedValue);
      }
    } else if (newValue !== stateRef.current) {
      setState(newValue);
    }
  }, []);

  return [state, setOptimizedState];
};

// Hook for managing loading states efficiently
export const useLoadingState = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState(null);

  const startLoading = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, []);

  const setLoadingError = useCallback((err) => {
    setLoading(false);
    setError(err);
  }, []);

  return {
    loading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
  };
};

// Hook for managing form state with validation
export const useFormState = (initialState = {}) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const updateField = useCallback((name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  }, [errors]);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const markFieldTouched = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  return {
    formData,
    errors,
    touched,
    updateField,
    setFieldError,
    markFieldTouched,
    resetForm,
  };
}; 