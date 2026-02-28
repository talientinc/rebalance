import { BrowserRouter } from "react-router-dom";
import { Rebalance } from "./features/rebalance/Rebalance";
import "./App.scss";

function App() {
    return (
        <BrowserRouter>
            <Rebalance />
        </BrowserRouter>
    );
}

export default App;
