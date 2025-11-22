import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import SoftwareEngineerProfile from "./apps/aden/SoftwareEngineerProfile";
import XtPrivateRoute from "./routes/XtPrivateRoute";
import NtPrivateRoute from "./routes/NtPrivateRoute";
// XP Tracker
import XtLayout from "./apps/xt/Layout";
// import XtNavbar from "./apps/xt/XtNavbar";
import XtLogin from "./apps/xt/Login";
import XtSignup from "./apps/xt/SignupPage";
import Home from "./apps/xt/Home";
import XtProfile from "./apps/xt/Profile";

// Chat
// XP Tracker
import NtLayout from "./apps/nt/Layout";
// import XtNavbar from "./apps/xt/XtNavbar";
import NtLogin from "./apps/nt/Login";
import NtSignup from "./apps/nt/SignupPage";
import NtFriends from "./apps/nt/UserFriends";
// import XtProfile from "./apps/xt/Profile";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public root routes */}
        {/* <Route path="/" element={<SoftwareEngineerProfile />} /> */}

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
        <Route path="/nt/login" element={<NtLogin />} />
        <Route path="/nt/register" element={<NtSignup />} />
        {/* <Route path="/nt/friends" element={<NtFriends />} /> */}

        <Route element={<NtPrivateRoute app="chat" />}>
          <Route path="/nt" element={<NtLayout />}>
            <Route index element={<NtFriends />} />
          </Route>
          <Route path="/" element={<NtLayout />}>
            <Route index element={<NtFriends />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
