import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";
import * as serviceWorker from "./serviceWorker";

import { library } from "@fortawesome/fontawesome-svg-core";

import {
    faQuestionCircle,
    faChevronCircleRight,
    faChevronCircleDown,
    faPlusCircle,
    faMinusCircle,
} from "@fortawesome/free-solid-svg-icons";

library.add(
    faQuestionCircle,
    faChevronCircleRight,
    faChevronCircleDown,
    faPlusCircle,
    faMinusCircle
);

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);

serviceWorker.register();
