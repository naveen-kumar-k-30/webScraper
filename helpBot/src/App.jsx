import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WebScrapper from './Component/WebScrapper';
import FileExtractor from './Component/FileExtractor';
import Login from './Component/Login';
import Register from './Component/Register';
import PrivateRoute from './AuthContext/PrivateRoute';
import Logout from './Component/Logout';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<PrivateRoute><WebScrapper /></PrivateRoute>} />
      <Route path="/logout" element={<PrivateRoute><Logout /></PrivateRoute>} />
      <Route path="/fileupload" element={<FileExtractor />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
      </Routes>
    </Router>
  );
};

export default App;
