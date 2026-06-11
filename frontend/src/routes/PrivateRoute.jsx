import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const PrivateRoute = ({ allowedRoles }) => {
    const { token, userRole } = useAuthStore();

    // টোকেন না থাকলে সরাসরি লগইন পেজে পাঠিয়ে দেবে 
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // ইউজারের রোল যদি অনুমোদিত রোলের সাথে না মেলে, তাহলেও আটকে দেবে
    if (allowedRoles && !allowedRoles.includes(userRole)) {
         // আপাতত লগইনে পাঠাচ্ছি, পরে 'Unauthorized' পেজে পাঠানো যাবে
        return <Navigate to="/login" replace />;
    }

    // সব ঠিক থাকলে চাইল্ড কম্পোনেন্ট (ড্যাশবোর্ড) রেন্ডার করবে
    return <Outlet />;
};

export default PrivateRoute;