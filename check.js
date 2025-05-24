import axios from "axios";
const baseURL =
  "https://assessors.apprenticeships.education.gov.uk/find-an-assessment-opportunity/ShowApprovedStandardDetails?standardReference=";
async function checkRedirects(url) {
  try {
    const axiosInstance = axios.create({
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://assessors.apprenticeships.education.gov.uk/",
        Cookie:
          "AnalyticsConsent=true; DASSeenCookieMessage=true; .Assessors.Session=CfDJ8IwntehR5Z5Ir5C0hRiL20waN4yHa9j%2FJdxZquOKd9cNRUKnydj%2FPXopHWp31QsXgIaTzqYnMPmHWmlEE9IIJz400rk5kVCaDAKTjxtjDJuWsPY9BKhDEQhkUCb2DBz2OKXTKTIMriK8yJq%2FT7RU4QHsOKtoqSOuODKxhWHsmm2Z; .Assessors.AntiForgery=CfDJ8IwntehR5Z5Ir5C0hRiL20y3pdkgYr80ELf4RkOiZcqGrjPBUNNr_SBtwz-sK8IEEbZkgL6SsUPEnUD12rxhhbsomtvY4wMLQfdIPNlkQJzzgYvF9C2syZ7RHQyOtqoxemCv4lZRuMQZwZHu3M7s4es",
      },
      withCredentials: true, // Allows cookies to be sent
    });
    const response = await axiosInstance.get(url, { maxRedirects: 0 });
    console.log("Redirect Location:", response.headers.location);
  } catch (error) {
    console.error(
      "Redirect error:",
      error.response?.headers?.location || error.message
    );
  }
}

checkRedirects(baseURL + "ST0096");
