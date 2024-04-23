import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import Home from "./pages/home";
import Dashboard from "./pages/Dashboard";
import NavBar from "./Components/common/Navbar";
import OpenRoute from "./Components/core/Auth/OpenRoute";
import PrivateRoute from "./Components/core/Auth/PrivateRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import MyProfile from "./Components/core/Dashboard/MyProfile";
import Settings from "./Components/core/Dashboard/Settings";
import EnrolledCourse from "./Components/core/Dashboard/EnrolledCourses";
import Cart from "./Components/core/Dashboard/Cart";
import Error from "./pages/Error"
import { ACCOUNT_TYPE } from "./utils/constants";
import Instructor from "./Components/core/Dashboard/InstructorDashboard/Instructor";
import AddCourse from "./Components/core/Dashboard/AddCourse";
import MyCourses from "./Components/core/Dashboard/MyCourses";
import EditCourse from "./Components/core/Dashboard/EditCourse";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";
import ViewCourse from "./pages/ViewCourse";
import VideoDetails from "./Components/core/ViewCourse/VideoDetails";
import { logout } from "../src/services/operations/authAPI"
import { toast } from "react-hot-toast";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.profile)
  const { token } = useSelector((state) => state.auth)
  console.log("token",token);

  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="catalog/:catalogName" element={<Catalog/>} />
      <Route path="courses/:courseId" element={<CourseDetails/>} />
      
        <Route
          path="signup"
          element={
            <OpenRoute>
              <Signup />
            </OpenRoute>
          }
        />
        <Route
          path="login"
          element={
            <OpenRoute>
              <Login />
            </OpenRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />
        <Route
          path="/about"
          element={
              <About />
          }
        />
        <Route path="/contact" element={<Contact />} />
        <Route 
      element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      }
    >
        <Route path="dashboard/my-profile" element={<MyProfile />} />
        <Route path="dashboard/Settings" element={<Settings />} />
        {
        user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
          <Route path="dashboard/cart" element={<Cart />} />
          <Route path="dashboard/enrolled-courses" element={<EnrolledCourse />} />
          </>
        )
      }

      {
        user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
          <Route path="dashboard/instructor" element={<Instructor />} />
          <Route path="dashboard/add-course" element={<AddCourse />} />
          <Route path="dashboard/my-courses" element={<MyCourses />} />
          <Route path="dashboard/edit-course/:courseId" element={<EditCourse />} />
          </>
        )
      }
      
    </Route>
    <Route element={
        <PrivateRoute>
          <ViewCourse />
        </PrivateRoute>
      }>

      {
        user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
          <Route 
            path="view-course/:courseId/section/:sectionId/sub-section/:subSectionId"
            element={<VideoDetails />}
          />
          </>
        )
      }
      </Route>



    <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
