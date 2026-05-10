import { Orders, OrdersCli } from "../orders";
import "./App.css";

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <OrdersCli />
        <Orders />
      </header>
    </div>
  );
};

export default App;
