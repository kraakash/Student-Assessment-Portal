const authorizeRoles = (...allowedRoles)=>{
   return (req,res,next)=>{
        if(!req.user){
            return res.status(401).json({
                  success: false,
                message: "Authentication required"
            })
        }
        console.log("Logged-in role:", req.user.role);
        console.log("Allowed roles:", allowedRoles);
        
          if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Insufficient permissions."
            });
        }

        next();
   }
}
export default authorizeRoles;