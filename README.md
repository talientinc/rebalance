# Rebalance Calculator

This project is a pure client-side single-page web application that calculates
the appropriate trades to be executed in order to rebalance a portfolio to its
target allocation. It will also calculate the purchases or sales to make when
contributing to or withdrawing from a portfolio.

The calculator supports defining fixed positions in a portfolio that count
towards the target allocation of one or more tradable positions, but are
excluded from any transactions produced by the calculator.

The calculator performs all of its work locally in the browser. There is no
corresponding server. Users can preserve their portfolio locally by creating
a bookmark URL that encodes the portfolio structure. Click on the saved
bookmark to open a page with the portfolio pre-populated (without amounts).

This TypeScript application was originally an example of a Create React App and
has since been migrated to use Vite. It uses hooks and Redux as the data store
via the Redux Toolkit. The bookmarking facility relies on React Router. The
layout and UI elements are implemented using Bootstrap and Font Awesome. The
production build of the calculator can be served from any static web server and
supports cached offline use (PWA).

The code is open source under the MIT license.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

The page will reload if you make edits.<br />

### `npm test`

Run the tests.<br />

### `npm run build`

Builds the app for production to the `dist` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!
