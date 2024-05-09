import { useLocation, Navigate, Outlet } from "react-router-dom";

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const decodedToken = token ? JSON.parse(atob(token.split('.')[1])): null;
    const userRoles = decodedToken ? decodedToken.role : [];
    const isAuthorized = allowedRoles.some(role=> userRoles.includes(role));
    return (
       isAuthorized ?
       <Outlet/> :
       <Navigate to ="/login" state={{from:location}} replace/>
    );
}

export default RequireAuth;