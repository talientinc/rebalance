import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { Rebalance } from "./features/rebalance/Rebalance";
import "./App.scss";

const Router = BrowserRouter as React.ComponentType<React.PropsWithChildren>;

function App() {
    return (
        <Router>
            <Route>
                <Rebalance />
            </Route>
        </Router>
    );
}

export default App;
