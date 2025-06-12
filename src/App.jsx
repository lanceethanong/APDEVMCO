import { Route, Routes } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
function App() {

  return (
    <div className="text-white h-[100vh] flex justify-center items-center bg-cover" style={{"background": "url('../src/assets/manila.png"}}>
      <Routes>
        <Route path='login' element={ <Login/> }/>
        <Route path='register' element={< Register/> }/>
      </Routes>
    </div>
  )
}

export default App
