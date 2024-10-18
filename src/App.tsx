import './App.css'
import useTimedHttpRequest from './useTimedHttpRequest'

const httpRequest = async () => {
  console.log("request started");

  const response = await fetch("http://localhost:3000/");
  const data = await response.json();
  return { status: response.status, data };
};

function App() {
  const { timeRemaining } = useTimedHttpRequest(httpRequest)
  return (
    <>
      hola
      {timeRemaining}
    </>
  )
}

export default App
