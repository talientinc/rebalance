import { BrowserRouter } from "react-router-dom";
import { Rebalance } from "./features/rebalance/Rebalance";
import "./App.scss";

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Rebalance />
        </BrowserRouter>
    );
}

export default App;
