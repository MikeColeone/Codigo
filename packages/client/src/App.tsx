import { test } from "@codigo/share";
import { Button } from "antd";
import "./assets/base.css";
function App() {
  return (
    <>
      <Button type="primary">Hello World</Button>
      <div className="text-lg font-bold text-red-100">{test}</div>
    </>
  );
}

export default App;
