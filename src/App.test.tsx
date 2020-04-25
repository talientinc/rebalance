import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';

import { library} from "@fortawesome/fontawesome-svg-core";

import {
    faQuestionCircle,
    faChevronCircleRight,
    faChevronCircleDown,
    faPlusCircle,
    faMinusCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(
    faQuestionCircle,
    faChevronCircleRight,
    faChevronCircleDown,
    faPlusCircle,
    faMinusCircle
);

test('renders portfolio summary', () => {
  const { getByText } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(getByText(/Portfolio Summary/i)).toBeInTheDocument();
});
