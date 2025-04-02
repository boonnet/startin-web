import React, { useState, useRef, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { Box, CssBaseline, useMediaQuery, Typography } from "@mui/material";
import "./App.css";

// Regular pages
import Homepage from "./pages/Homepage";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhoWeAre from "./pages/WhoWeAre";
import ContactUs from "./pages/ContactUs";
import Courses from "./pages/Courses";
import PaymentPage from "./pages/PaymentPage";
import SubscriptionDetails from "./pages/Subscriptions";
import CourseDetails from "./pages/CourseDetails";
import TemplateDetails from "./pages/TemplateDetails";
import CourseContent from "./pages/CourseContent";

// Dashboard components
import DashboardNavbar from "./UserDashboard/DashboardNavbar";
import Sidebar from "./UserDashboard/Sidebar";
import Dashboard from "./UserDashboard/Dashboard";
import MyCourses from "./UserDashboard/MyCourses";
import MyLearnings from "./UserDashboard/MyLearnings";
import MyTemplates from "./UserDashboard/MyTemplates";
import MyLearningsViewCourse from './UserDashboard/MyLearningsViewCourse'
import QuizPage from "./UserDashboard/QuizPage";
import Favorites from "./UserDashboard/Favorites";
import PurchaseHistory from "./UserDashboard/PurchaseHistory";
import Notifications from "./UserDashboard/Notifications";
import EditProfile from "./UserDashboard/EditProfile";
import EmailVerification from "./pages/EmailVerification";
import CreateNewPassword from "./pages/CreateNewPassword";
import Templates from "./pages/Templates";

// Dashboard Layout Component with route awareness
const DashboardLayout = () => {
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const drawerWidth = 240;
  const scrollContainerRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get the current page name for the breadcrumb
  const getPageName = () => {
    const path = location.pathname.split("/").pop();
    if (path === "dashboard" || path === "") return "Dashboard";
    return (
      path.charAt(0).toUpperCase() + path.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* App Bar */}
      <DashboardNavbar toggleSidebar={toggleSidebar} />

      {/* Main content area with sidebar and main content */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: "flex",
          flexGrow: 1,
          overflow: "auto" // Changed from "hidden" to "auto" to enable scrolling at container level
        }}
      >
        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentPath={location.pathname}
          width={drawerWidth}
          scrollContainer={scrollContainerRef}
        />

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { xs: "100%", sm: `calc(100% - ${drawerWidth}px)` },
            ml: { xs: 0, },
            transition: theme => theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            // overflow: "visible", // Changed from "auto" to "visible" so scrolling is handled by parent
            height: '100vh',
            overflowY: 'scroll',
          }}
          className="scrollable-content"
        >
          {/* Breadcrumb */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Home / Dashboard{" "}
              {location.pathname !== "/dashboard" && `/ ${getPageName()}`}
            </Typography>
          </Box>

          {/* This is where nested routes will render */}
          <Outlet />
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Homepage />
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/new" element={<CreateNewPassword />} />
          <Route
            path="/WhoWeAre"
            element={
              <>
                <WhoWeAre />
              </>
            }
          />
          <Route
            path="/ContactUs"
            element={
              <>
                <ContactUs />
              </>
            }
          />
          <Route
            path="/Courses"
            element={
              <>
                <Courses />
              </>
            }
          />
          <Route
            path="/Templates"
            element={
              <>
                <Templates />
              </>
            }
          />
          <Route
            path="/PaymentPage"
            element={
              <>
                <PaymentPage />
              </>
            }
          />
          <Route path="subscriptions" element={<SubscriptionDetails />} />
          <Route path="course/:id" element={<CourseDetails />} />
          <Route path="template/:id" element={<TemplateDetails />} />
          <Route path="/coursecontent/:id" element={<CourseContent />} />

          {/* Dashboard Routes - Using nested routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="mycourses" element={<MyCourses />} />
            <Route path="mylearnings" element={<MyLearnings />} />
            <Route path="mytemplates" element={<MyTemplates />} />
            <Route path="MyLearningsViewCourse/:id" element={<MyLearningsViewCourse />} />
            <Route path="quiz/:courseId/:lessonId" element={<QuizPage />} />

            <Route
              path="favorites"
              element={<Favorites />}
            />
            <Route
              path="notifications"
              element={<Notifications />}
            />
            <Route
              path="history"
              element={<PurchaseHistory />}
            />
            <Route
              path="profile"
              element={<EditProfile />}
            />
          </Route>

          {/* Handle old route path for backward compatibility */}
          <Route
            path="/mycourses"
            element={<Navigate to="/dashboard/mycourses" replace />}
          />

          {/* Redirect unknown routes to homepage */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;