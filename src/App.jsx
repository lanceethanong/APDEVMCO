import { Route, Routes } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import LoginBackground from './LoginBackground.jsx';
import Dashboard from './DashBoard.jsx';
import DashboardLayout from './DashBoardLayout.jsx';
function App() {
  return (
    <Routes>
      <Route
        path="login"
        element={
          <LoginBackground>
            <Login />
          </LoginBackground>
        }
      />
      <Route
        path="register"
        element={
          <LoginBackground>
            <Register />
          </LoginBackground>
        }
      />
      <Route
        path="dashboard"
        element={
          <DashboardLayout>
          <Dashboard />
          </DashboardLayout>
        }/>

    </Routes>
  );
}

export default App
