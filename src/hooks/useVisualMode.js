import { useState } from "react";

export default function useVisualMode(initial) {
  const [mode, setMode] = useState(initial);
  const [history, setHistory] = useState([initial]);

  const transition = (newMode, replace = false) => {
    if (replace) {
      const historyCopy = [...history];
      historyCopy.pop();
      historyCopy.push(newMode);
      setHistory(historyCopy);
      setMode(newMode);
    } else {
      setHistory((prev) => [...prev, newMode]);
      setMode(newMode);
    }
  };

  const back = () => {
    if (history.length > 1) {
      const historyCopy = [...history];
      historyCopy.pop();
      setHistory(historyCopy);
      setMode(historyCopy[historyCopy.length - 1]);
    }
  };

  return { mode, transition, back };
}
