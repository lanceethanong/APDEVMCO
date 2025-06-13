import { Route, Routes } from 'react-router-dom';
import Login from './Login.jsx';
import Register from './Register.jsx';
import LoginBackground from './LoginBackground.jsx';
import Dashboard from './Dashboard.jsx';
import DashBoardTechnician from './technician-Dashboard.jsx';
import DashboardLayout from './DashBoardLayout.jsx';
import DashboardLayoutTechnician from './technician-DashBoardLayout.jsx';
import Help from './help.jsx';
import HelpTechnician from './technician-help.jsx';
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
        <Route
        path="dashboard-technician"
        element={
          <DashboardLayoutTechnician>
          <DashBoardTechnician />
          </DashboardLayoutTechnician>
        }/>
        
      <Route path="help" element={<Help />} />
      <Route path="help-technician" element={<HelpTechnician />} />

    </Routes>
  );
}

export default App
