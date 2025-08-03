# Contexts

## Purpose

The `contexts/` folder contains React Context definitions that provide shared state and functionality across components in our application. Contexts handle state management, UI-related logic, and coordinate with services for data operations.

## When to Use Contexts

Use contexts when:

- Multiple components need access to the same state
- You need to share state across different parts of the component tree
- You want to avoid prop drilling (passing props through multiple levels)
- You need to coordinate UI state with data fetching operations

Contexts should **not** contain:
- Direct database or API operations (use services instead)
- Complex business logic unrelated to UI state (use services)
- Utility functions not related to state (use utils)

## Folder Structure

```
contexts/
├── AccountsContext.tsx  - Manages accounts state and operations
├── CreditCardContext.tsx - Manages credit card state and operations
├── DemoModeContext.tsx - Handles demo/production mode switching
└── ... other contexts
```

## Usage Examples

### Creating and Using a Context

```tsx
// 1. Define your context
// contexts/SampleContext.tsx
import React, { createContext, useState, useContext } from 'react';
import * as sampleService from '@/services/sampleService';

export const SampleContext = createContext({
  data: [],
  loading: false,
  error: null,
  fetchData: async () => {}
});

// 2. Create a provider component
export const SampleProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Use service for data operations
      const result = await sampleService.fetchData();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <SampleContext.Provider value={{ data, loading, error, fetchData }}>
      {children}
    </SampleContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useSample = () => {
  const context = useContext(SampleContext);
  if (context === undefined) {
    throw new Error('useSample must be used within a SampleProvider');
  }
  return context;
};
```

### Using the Context in Components

```tsx
// components/SampleComponent.tsx
import { useSample } from '@/contexts/SampleContext';

export const SampleComponent = () => {
  const { data, loading, error, fetchData } = useSample();

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
``` 