import { useState } from "react";
import "./App.css";
import SlotMachine from "./SlotsMachine";
import WinProbabilitySetter from "./WinProbabilitySetter";

function App() {
  const [winProbability, setWinProbability] = useState(0.6);
  return (
    <div className="App">
      <header className="bg-blue-500 text-white p-4">
        <h1 className="text-2xl">Hello Test Customer</h1>
      </header>
      <main className="p-4">
        <SlotMachine winProbability={winProbability} />
        <WinProbabilitySetter
          winProbability={winProbability}
          setWinProbability={setWinProbability}
        />
      </main>
    </div>
  );
}

export default App;
