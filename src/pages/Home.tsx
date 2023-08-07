import { useState } from 'react'
import './Home.less'

function HomePage() {
  const [count, setCount] = useState(0);
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="https://img.alicdn.com/imgextra/i4/O1CN01YcoPwx1PP6SSRxxx0_!!6000000001832-55-tps-32-32.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="https://img.alicdn.com/imgextra/i2/O1CN01ERwWqe1dEwHvhqnxp_!!6000000003705-55-tps-36-32.svg" className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default HomePage