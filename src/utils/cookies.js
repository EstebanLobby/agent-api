exports.setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000,
    });
  };
  
  exports.clearRefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  };
  