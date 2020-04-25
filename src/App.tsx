import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Rebalance } from "./features/rebalance/Rebalance";
import "./App.scss";

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
