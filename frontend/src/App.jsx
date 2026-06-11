import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import PublicLayout from './components/PublicLayout';

// Public Pages
import Home from './pages/public/Home';
import NoticeBoard from './pages/public/NoticeBoard';
import AboutUs from './pages/public/AboutUs';
import Login from './pages/Login';
import ContactUs from './pages/public/ContactUs';
import Admissions from './pages/public/Admissions';
import Events from './pages/public/Events';
import TeachersCorner from './pages/public/TeachersCorner';
import Blogs from './pages/public/Blogs';
import EventGallery from './pages/public/EventGallery';
import EventRegistration from './pages/public/EventRegistration';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Students from './pages/admin/Students';
import AddStudent from './pages/admin/AddStudents';
import EditStudent from './pages/admin/EditStudent';
import TeacherAttendance from './pages/admin/TeacherAttendance';
import Teachers from './pages/admin/Teachers';
import AddTeacher from './pages/admin/AddTeacher';
import EditTeacher from './pages/admin/EditTeacher';
import FeeCategories from './pages/admin/FeeCategories';
import CollectFee from './pages/admin/CollectFee';
import Receipt from './pages/admin/Receipt';
import FeeReports from './pages/admin/FeeReports';
import Exams from './pages/admin/Exams';
import SubjectExams from './pages/admin/SubjectExams';
import MarksEntry from './pages/admin/MarksEntry';
import GradesSetup from './pages/admin/GradesSetup';
import ResultSheet from './pages/admin/ResultSheet';
import Marksheet from './pages/admin/Marksheet';
import AdmitCards from './pages/admin/AdmitCards';
import ClassTests from './pages/admin/ClassTests';
import Accounts from './pages/admin/Accounts';
import Inventory from './pages/admin/Inventory';
import SMSGateway from './pages/admin/SMSGateway';
// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentResults from './pages/student/StudentResults';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentAttendance from './pages/teacher/StudentAttendance';
import TeacherResults from './pages/teacher/TeacherResults';

// Parent Pages
import ParentDashboard from './pages/parent/ParentDashboard';


import Careers from './pages/public/Careers';
import RecruitmentAdmin from './pages/admin/RecruitmentAdmin';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/notice-board" element={<NoticeBoard />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/events" element={<Events />} />
          <Route path="/teachers-corner" element={<TeachersCorner />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/events/:id/gallery" element={<EventGallery />} />
          <Route path="/events/:id/register" element={<EventRegistration />} />
          <Route path="/careers" element={<Careers />} />
        </Route>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/sms-gateway" element={<SMSGateway />} />
            {/* Students */}
            <Route path="/admin/students" element={<Students />} />
            <Route path="/admin/students/add" element={<AddStudent />} />
            <Route path="/admin/students/edit/:id" element={<EditStudent />} />

            {/* Teachers */}
            <Route path="/admin/teachers" element={<Teachers />} />
            <Route path="/admin/teachers/add" element={<AddTeacher />} />
            <Route path="/admin/teachers/edit/:id" element={<EditTeacher />} />
            <Route path="/admin/teacher-attendance" element={<TeacherAttendance />} />

            {/* Fees */}
            <Route path="/admin/fee-categories" element={<FeeCategories />} />
            <Route path="/admin/collect-fee" element={<CollectFee />} />
            <Route path="/admin/receipt/:id" element={<Receipt />} />
            <Route path="/admin/fee-reports" element={<FeeReports />} />

            {/* Exams */}
            <Route path="/admin/exams" element={<Exams />} />
            <Route path="/admin/exam-routine" element={<SubjectExams />} />
            <Route path="/admin/marks-entry" element={<MarksEntry />} />
            <Route path="/admin/grades-setup" element={<GradesSetup />} />
            <Route path="/admin/result-sheet" element={<ResultSheet />} />
            <Route path="/admin/marksheet/:examId/:studentId" element={<Marksheet />} />
            <Route path="/admin/admit-cards" element={<AdmitCards />} />
            <Route path="/admin/class-tests" element={<ClassTests />} />
            <Route path="/admin/accounts" element={<Accounts />} />
            {/* Student Routes (Fixed paths) */}
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/results" element={<StudentResults />} />

            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/attendance" element={<StudentAttendance />} />
            <Route path="/teacher/results" element={<TeacherResults />} />
            {/* Parent Routes */}
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            {/* Recruitment Admin */}
            <Route path="/admin/recruitment" element={<RecruitmentAdmin />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;