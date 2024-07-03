import { useLocation, Navigate, Outlet } from "react-router-dom";
import api from "../Pages/axiosInstance";

const RequireAuth = ({ allowedRoles }) => {
    const location = useLocation();
    const token = api.getAccessToken("token");
    let userRoles = [];
    if(token){
        try{
        const decodedToken = token ? JSON.parse(atob(token.split('.')[1])): null;
        userRoles = decodedToken ? decodedToken.role : [];
        
        }catch (e) {
            console.error('Invalid token', e);
        }
        
    }
    const isAuthorized = allowedRoles.some(role=> userRoles.includes(role));
    return (
       isAuthorized ?
       <Outlet/> :
       <Navigate to ="/login" state={{from:location}} replace/>
    );
}

export default RequireAuth;