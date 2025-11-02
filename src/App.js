import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SoftwareEngineerProfile from "./apps/aden/SoftwareEngineerProfile";
import XtPrivateRoute from "./routes/XtPrivateRoute";

// XP Tracker
import XtLayout from "./apps/xt/Layout";
// import XtNavbar from "./apps/xt/XtNavbar";
import XtLogin from "./apps/xt/Login";
import XtSignup from "./apps/xt/SignupPage";
import Home from "./apps/xt/Home";
import XtProfile from "./apps/xt/Profile";

// // Chat
// import ChatLayout from "./apps/chat/ChatLayout";
// import ChatNavbar from "./apps/chat/ChatNavbar";
// import ChatLogin from "./apps/chat/ChatLogin";
// import ChatSignup from "./apps/chat/ChatSignup";
// import ChatHome from "./apps/chat/ChatHome";
// import Messages from "./apps/chat/Messages";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public root routes */}
        <Route path="/" element={<SoftwareEngineerProfile />} />

        {/* --- XP TRACKER --- */}
        <Route path="/xt/login" element={<XtLogin />} />
        <Route path="/xt/register" element={<XtSignup />} />

        <Route element={<XtPrivateRoute app="xt" />}>
          <Route path="/xt" element={<XtLayout />}>
            <Route index element={<Home />} />
            <Route path="/xt/profile" element={<XtProfile />} />
          </Route>
        </Route>

        {/* --- CHAT --- */}
        {/* <Route path="/chat/login" element={<ChatLogin />} />
        <Route path="/chat/register" element={<ChatSignup />} />

        <Route element={<PrivateRoute app="chat" />}>
          <Route path="/chat" element={<ChatLayout />}>
            <Route index element={<ChatHome />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Route> */}
      </Routes>
    </Router>
  );
};

export default App;
