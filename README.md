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

This Typescript application is an example of a Create React App. It uses
hooks and Redux as the data store via the Redux Toolkit. The bookmarking
facility relies on React Router. The layout and UI elements are implemented
using Bootstrap and Font Awesome. The production build of the calculator can be
served from any static web server and supports cached offline use (PWA).

The code is open source under the MIT license.

For those of you who wish to build and run your own copy, here are the original
instructions produced by the Create React App template. The modifications from
the original configuration were minimal:

-   Turned off the @typescript-eslint/no-unused-vars rule because lint is _still_
    struggling to recognize when a selector is being used in a render function.
-   Made the version information accessible as an environment variable in the
    production build.

---

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app), using the [Redux](https://redux.js.org/) and [Redux Toolkit](https://redux-toolkit.js.org/) template.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
