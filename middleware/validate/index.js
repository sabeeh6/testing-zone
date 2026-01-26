import logger from "../../config/logger";


export const validationRequest =(schema) => (req,res,next)=>{
    try {
        const result = schema.safeParseAsync(req.body)
        if (!result.success) {
            console.log("❌ Validation failed:", result.error.issues);
            const error = result.error.issues.map((err)=>({
                field:err.path.join('.'),
                message:err.message,
                code:err.code
            }))

            return res.status(400).json({
                success:false,
                message:"Validation error",
                error
            })
        }
        next()

    } catch (error) {
        logger.error("Validation Error" , error)
        return res.status(500).json({ success: false, message: "Internal server error" })
    }
}
