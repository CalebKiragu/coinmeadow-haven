
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '@/lib/redux/slices/authSlice';

// Create a test store with required reducers
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      // Add other reducers as needed for tests
    },
    preloadedState,
  });
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Record<string, any>;
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  { preloadedState = {}, ...renderOptions }: CustomRenderOptions = {}
) => {
  const store = createTestStore(preloadedState);
  
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    );
  };
  
  return {
    store,
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
  };
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { customRender as render };
