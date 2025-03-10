
import { useSearchParams } from "react-router-dom";

export const useResetUrlParams = () => {
  const [searchParams] = useSearchParams();

  const getUrlParams = () => {
    const token = searchParams.get("token");
    const code = searchParams.get("code");
    const type = searchParams.get("type");
    const emailParam = searchParams.get("email");
    const errorParam = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    console.log("Verifying URL parameters for reset:");
    console.log("Token:", token ? "Present" : "Not present");
    console.log("Code:", code ? "Present" : "Not present");
    console.log("Type:", type);
    console.log("Email:", emailParam);
    console.log("Error:", errorParam);
    console.log("Error Description:", errorDescription);
    console.log("Access Token:", accessToken ? "Present" : "Not present");
    console.log("Refresh Token:", refreshToken ? "Present" : "Not present");

    return {
      token,
      code,
      type,
      emailParam,
      errorParam,
      errorDescription,
      accessToken,
      refreshToken
    };
  };

  return {
    getUrlParams,
    searchParams
  };
};
