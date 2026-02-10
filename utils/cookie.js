

export const setCookies = (res,token)=>{
    const cookiesOptions={
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite:'strict',
        maxAge: 2*24*60*60*1000,
        path:'/'
    }
    return res.cookie('authToken' , token , cookiesOptions)
}

export const clearCookies = (res) => {
    res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });
};
