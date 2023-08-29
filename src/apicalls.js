import axios from "axios";
export const BaseUrl = process.env.REACT_APP_BASE_URL;
export const apikey = process.env.REACT_APP_APIKEY;

//Auth
export const initialFetch = async (dispatch) => {
  const token = JSON.parse(localStorage.getItem("User_ATS_Token")) || null;
  const type = JSON.parse(localStorage.getItem("User_ATS_Type")) || null;

  setCountry();

  if (token && type) {
    try {
      await setCategoriesInLocalStorage();
      dispatch({ type: "SET_TOKEN", payload: token });
      dispatch({ type: "SET_TYPE", payload: type });
      const res = await axios.get(`${BaseUrl}/employee/data/`, {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      });
      dispatch({ type: "SET_PROFILE", payload: res.data });

      if (type === "EMPLOYER") await setSubscriptionDetails(token, dispatch);
    } catch (err) {
      signout(dispatch);
    } finally {
      dispatch({ type: "INITIAL_FETCH_DONE" });
    }
  } else {
    dispatch({ type: "INITIAL_FETCH_DONE" });
    await setCategoriesInLocalStorage();
  }
};

export const setCountry = async () => {
  try {
    const res = await axios.get("https://ipapi.co/json/");
    localStorage.setItem(
      "User_ATS_Country",
      JSON.stringify(res.data.country_name)
    );
  } catch (err) {
    console.log(err);
  }
};

export const signout = (dispatch) => {
  localStorage.removeItem("User_ATS_Token");
  localStorage.removeItem("User_ATS_Type");

  dispatch({
    type: "USER_SIGNOUT",
  });
};

export const employeeRegister = async (req, dispatch, toast, navigate) => {
  dispatch({ type: "LOGIN_USER_START" });
  try {
    const res = await axios.post(`${BaseUrl}/user/register/`, req, {
      headers: {
        apikey,
      },
    });
    toast(
      "A confirmation mail has been sent to your email. Please confirm your account."
    );
    navigate("/signin");
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  } finally {
    dispatch({ type: "LOGIN_USER_STOPFETCHING" });
  }
};

export const employeeLogin = async (req, dispatch, toast, navigate) => {
  dispatch({ type: "LOGIN_USER_START" });
  try {
    const res = await axios.post(`${BaseUrl}/employee/login-token/`, req, {
      headers: {
        apikey,
      },
    });

    localStorage.setItem("User_ATS_Token", JSON.stringify(res.data.token));
    localStorage.setItem("User_ATS_Type", JSON.stringify("EMPLOYEE"));

    await setEmployeeProfile(res.data.token, dispatch);

    dispatch({
      type: "LOGIN_USER_SUCCESS",
      payload: { token: res.data.token, type: "EMPLOYEE" },
    });

    navigate("/dashboard");
  } catch (err) {
    console.log(err);
    toast("The email or password that you've entered is incorrect.");
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  }
};

export const employerRegister = async (req, dispatch, toast, navigate) => {
  dispatch({ type: "LOGIN_USER_START" });
  console.log(req);
  try {
    const res = await axios.post(`${BaseUrl}/user/register/`, req, {
      headers: {
        apikey,
      },
    });
    toast("A mail has been send to confirm your email id");
    navigate("/signin");
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  } finally {
    dispatch({ type: "LOGIN_USER_STOPFETCHING" });
  }
};

export const employerLogin = async (req, dispatch, toast, navigate) => {
  dispatch({ type: "LOGIN_USER_START" });
  try {
    const res = await axios.post(`${BaseUrl}/employer/login-token/`, req, {
      headers: {
        apikey,
      },
    });

    localStorage.setItem("User_ATS_Token", JSON.stringify(res.data.token));
    localStorage.setItem("User_ATS_Type", JSON.stringify("EMPLOYER"));

    await setEmployeeProfile(res.data.token, dispatch);
    await setSubscriptionDetails(res.data.token, dispatch);

    dispatch({
      type: "LOGIN_USER_SUCCESS",
      payload: { token: res.data.token, type: "EMPLOYER" },
    });

    navigate("/dashboard");
  } catch (err) {
    console.log(err);
    toast("Password and email do not match");
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  }
};

export const googleLogin = async (idToken, dispatch, toast, navigate) => {
  dispatch({ type: "LOGIN_USER_START" });
  try {
    console.log(idToken);
    const res = await axios.post(
      `${BaseUrl}/user/google/login-token/`,
      {
        token: idToken,
      },
      {
        headers: {
          apikey,
        },
      }
    );
    console.log(res.data);
    localStorage.setItem("User_ATS_Token", JSON.stringify(res.data.token));
    localStorage.setItem("User_ATS_Type", JSON.stringify("EMPLOYEE"));

    await setEmployeeProfile(res.data.token, dispatch);

    dispatch({
      type: "LOGIN_USER_SUCCESS",
      payload: { token: res.data.token, type: "EMPLOYEE" },
    });

    navigate("/dashboard");
  } catch (err) {
    if (err.response.status === 500)
      toast("Account not found. Please register.");
    else toast("Something Went Wrong");
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  }
};

export const googleRegister = async (
  req,
  idToken,
  dispatch,
  toast,
  navigate
) => {
  dispatch({ type: "LOGIN_USER_START" });
  try {
    console.log(req);
    req.password = "admin@123";
    req.password2 = "admin@123";
    const res1 = await axios.post(
      `${BaseUrl}/user/google/register/`,
      {
        token: idToken,
      },
      {
        headers: {
          apikey,
        },
      }
    );
    const res2 = await axios.post(
      `${BaseUrl}/user/register/`,
      {
        firebase_id: res1.data.id,
        ...req,
      },
      {
        headers: {
          apikey,
        },
      }
    );
    console.log(res1.data);
    console.log(res2.data);
    googleLogin(idToken, dispatch, toast, navigate);
  } catch (err) {
    console.log(err);
    toast("Something Went Wrong");
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  }
};

export const linkedinRegister1 = async (data, toast) => {
  console.log(data);
  try {
    const res = await axios.post(`${BaseUrl}/user/linkedin/register/`, data, {
      headers: {
        apikey,
      },
    });
    console.log(res.data);
    return res.data;
  } catch (err) {
    console.log(err);
    toast("Something Went Wrong");
    return null;
  }
};

export const linkedinRegister2 = async (data, dispatch, toast, navigate) => {
  dispatch({ type: "LOGIN_USER_START" });
  console.log(data);
  try {
    data.password = "Admin@123";
    data.password2 = "Admin@123";
    const res = await axios.post(`${BaseUrl}/user/register/`, data, {
      headers: {
        apikey,
      },
    });
    console.log(res.data);
    toast("Registration Successful");
    navigate("/signin");
  } catch (err) {
    console.log(err);
    toast("Something Went Wrong");
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  }
};

export const linkedinLogin = async (data, dispatch, toast, navigate) => {
  dispatch({ type: "LOGIN_USER_START" });
  console.log(data);
  try {
    const res = await axios.post(
      `${BaseUrl}/user/linkedin/login-token/`,
      data,
      {
        headers: {
          apikey,
        },
      }
    );
    localStorage.setItem("User_ATS_Token", JSON.stringify(res.data.token));
    localStorage.setItem("User_ATS_Type", JSON.stringify("EMPLOYEE"));
    await setEmployeeProfile(res.data.token, dispatch);
    dispatch({
      type: "LOGIN_USER_SUCCESS",
      payload: { token: res.data.token, type: "EMPLOYEE" },
    });
    navigate("/dashboard");
  } catch (err) {
    console.log(err);
    toast("Something Went Wrong");
    dispatch({ type: "LOGIN_USER_FAILURE", payload: err });
  }
};

export const passwordResetEmailSend = async (
  email,
  toast,
  navigate,
  setLoading
) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/user/password/send/`,
      { email },
      {
        headers: {
          apikey,
        },
      }
    );
    toast(
      "Password reset link has been send to your registered email address."
    );

    const triggerCall = setTimeout(() => {
      navigate("/signin");
    }, 5000);
    return () => clearTimeout(triggerCall);
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

export const passwordResetPasswordSend = async (
  password,
  token,
  toast,
  navigate,
  setLoading
) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/user/resetpassword/`,
      { password },
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Password has been changed successfully please sign in.");

    const triggerCall = setTimeout(() => {
      navigate("/signin");
    }, 5000);
    return () => clearTimeout(triggerCall);
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

//Profile
export const setEmployeeProfile = async (token, dispatch) => {
  try {
    const res = await axios.get(`${BaseUrl}/employee/data/`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    dispatch({
      type: "SET_PROFILE",
      payload: res.data,
    });
  } catch (err) {
    console.log(err);
  }
};

export const getEmployeeProfile = async (params) => {
  const token = params.queryKey[1];
  console.log(token)
  const res = await axios.get(`${BaseUrl}/employee/data/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  console.log(res.data)
  return res.data;
};



export const editEmployeeProfile = async (
  token,
  data,
  setLoading,
  dispatch,
  toast,
  navigate
) => {
  try {
    const res = await axios.patch(`${BaseUrl}/employee/data/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    await setEmployeeProfile(token, dispatch);
    setLoading(false);
    toast("Profile Updated");
    navigate("/profile");
  } catch (err) {
    setLoading(false);
    toast("Something went wrong");
  }
};

//Education
export const getEducation = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/employee/education/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const postEducation = async (token, data, toast, setLoading) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/employee/education/`,
      [{ ...data }],
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    setLoading(false);
    toast("Education posted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    setLoading(false);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILURE";
  }
};

export const patchEducation = async (token, data, id, toast, setLoading) => {
  try {
    const res = await axios.patch(`${BaseUrl}/employee/education/${id}`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    setLoading(false);
    toast("Education edited");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    setLoading(false);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILURE";
  }
};

export const deleteEducation = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/employee/education/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

//Experience
export const getExperience = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/employee/experience/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const postExperience = async (token, data, toast, setLoading) => {
  console.log(data);
  try {
    const res = await axios.post(
      `${BaseUrl}/employee/experience/`,
      [{ ...data }],
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    setLoading(false);
    toast("Experience posted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    setLoading(false);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILURE";
  }
};

export const patchExperience = async (token, data, id, toast, setLoading) => {
  try {
    const res = await axios.patch(
      `${BaseUrl}/employee/experience/${id}`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    setLoading(false);
    toast("Experience edited");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    setLoading(false);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILURE";
  }
};

export const deleteExperience = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/employee/experience/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

//Skill
export const getSkill = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/employee/skill/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const postSkill = async (token, data, toast, setLoading) => {
  try {
    const res = await axios.post(`${BaseUrl}/employee/skill/`, [{ ...data }], {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    setLoading(false);
    toast("Skill Posted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    setLoading(false);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILURE";
  }
};

export const patchSkill = async (token, data, id, toast, setLoading) => {
  try {
    const res = await axios.patch(`${BaseUrl}/employee/skill/${id}`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    setLoading(false);
    toast("Skill Edited");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    setLoading(false);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILURE";
  }
};

export const deleteSkill = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/employee/skill/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

//Parsing
export const postParsedData = async (
  token,
  education,
  experience,
  skill,
  toast,
  setLoading
) => {
  try {
    if (education.length) {
      const res1 = await axios.post(
        `${BaseUrl}/employee/education/`,
        education,
        {
          headers: {
            Authorization: `Token ${token}`,
            apikey,
          },
        }
      );
    }

    if (experience.length) {
      const res2 = await axios.post(
        `${BaseUrl}/employee/experience/`,
        experience,
        {
          headers: {
            Authorization: `Token ${token}`,
            apikey,
          },
        }
      );
    }

    if (skill.length) {
      const res2 = await axios.post(`${BaseUrl}/employee/skill/`, skill, {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      });
    }

    setLoading(false);
    toast("Data updated");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    setLoading(false);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILURE";
  }
};

//Job
export const getJobList = async () => {
  const res = await axios.get(`${BaseUrl}/jobs/job-list/`, {
    headers: {
      apikey,
    },
  });
  return res.data;
};

export const getJobScore = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];
  const res = await axios.get(`${BaseUrl}/employee/get-score/${jobId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getJobsByFilter = async (filterString, setLoading, setError) => {
  try {
    const res = await axios.get(`${BaseUrl}/jobs/job-list/?${filterString}`, {
      headers: {
        apikey,
      },
    });
    setLoading(false);
    return res.data;
  } catch (err) {
    console.log(err);
    setLoading(false);
    return [];
  }
};

export const getJobListSearch = async (filterString, setLoading, setError) => {
  try {
    const res = await axios.get(
      `${BaseUrl}/jobs/search-job-list/?${filterString}`,
      {
        headers: {
          apikey,
        },
      }
    );
    setLoading(false);
    return res.data;
  } catch (err) {
    console.log(err);
    setLoading(false);
    setError(true);
    return [];
  }
};

export const getJobById = async (params) => {
  const token = params.queryKey[1];
  const id = params.queryKey[2];
  const res = await axios.get(`${BaseUrl}/jobs/job-list/${id}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getJobApplications = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/jobs/currentjobs/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  let jobs = {
    applied: [...res.data],
    rejected: [],
    accepted: [],
    qualified: [],
  };
  for (let i = 0; i < res.data.length; i++) {
    if (res.data[i].status === "ACCEPTED") {
      jobs = { ...jobs, accepted: [...jobs.accepted, res.data[i]] };
    }

    if (res.data[i].status === "REJECTED") {
      jobs = { ...jobs, rejected: [...jobs.rejected, res.data[i]] };
    }

    if (res.data[i].status === "QUALIFIED") {
      jobs = { ...jobs, qualified: [...jobs.qualified, res.data[i]] };
    }
  }
  return jobs;
};

export const postJobApplication = async (
  token,
  jobId,
  resumeId,
  responses,
  toast,
  setLoading,
  navigate
) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/jobs/currentjobs/`,
      { job: jobId, responses, resume: resumeId },
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Job Successfully Applied");
    setLoading(false);
    navigate("/dashboard");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const postJob = async (token, data, toast, setLoading, navigate) => {
  try {
    data.salary_max = 0;
    data.salary_min = 0;
    const res = await axios.post(`${BaseUrl}/jobs/employer-job-list/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Job Posted");
    navigate("/dashboard/postedjob");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const getJobPosts = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/jobs/employer-job-list/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getPostedJobsByFilter = async (
  token,
  filterString,
  setLoading
) => {
  try {
    const res = await axios.get(
      `${BaseUrl}/jobs/employer-job-list/?${filterString}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    setLoading(false);
    return res.data;
  } catch (err) {
    console.log(err);
    setLoading(false);
    return [];
  }
};

export const deleteJob = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/jobs/employer-job-list/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Job Deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

export const getJobApplicants = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];

  const res = await axios.get(`${BaseUrl}/employer/candidate-by-job/${jobId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const postJobApplicantStatus = async (
  token,
  data,
  toast,
  setLoading
) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/employer/candidate-status-change/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );

    toast("Status Changed");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const patchJob = async (token, id, data, toast, setLoading) => {
  try {
    data.salary_max = 0;
    data.salary_min = 0;
    const res = await axios.patch(
      `${BaseUrl}/jobs/employer-job-list/${id}`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Job Edited");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const getOnboardingJobList = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/jobs/employer-job-list/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });

  let arr = res.data.filter(function (e) {
    return e.is_active;
  });
  return arr;
};

//Job Questions
export const getJobQuestions = async (params) => {
  const token = params.queryKey[1];
  const id = params.queryKey[2];

  const res = await axios.get(`${BaseUrl}/employer/question-by-job/${id}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const postJobQuestion = async (token, data, toast, setLoading) => {
  try {
    const res = await axios.post(`${BaseUrl}/employer/question/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Job Question Added");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const deleteJobQuestion = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/employer/question/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Question Deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

export const getJobQuestionResponse = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];
  const employeeId = params.queryKey[3];

  const res = await axios.get(
    `${BaseUrl}/employer/candidate-response-by-job/${jobId}?employee=${employeeId}`,
    {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    }
  );
  return res.data;
};

//Onboarding
export const postJobOnboardingQuestion = async (
  token,
  data,
  toast,
  setLoading
) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/employer/onboarding/questions/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Job Question Posted");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const getJobOnboardingQuestions = async (params) => {
  const token = params.queryKey[1];
  const id = params.queryKey[2];

  const res = await axios.get(
    `${BaseUrl}/employer/onboarding/questions/${id}`,
    {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    }
  );
  return res.data;
};

export const deleteJobOnboardingQuestion = async (token, id, toast) => {
  try {
    const res = await axios.delete(
      `${BaseUrl}/employer/onboarding/delete-question/${id}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Question Deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

export const postJobOnboardingVideo = async (
  file,
  jobId,
  token,
  toast,
  setLoading
) => {
  try {
    const data = new FormData();
    data.append("video", file);
    data.append("job", jobId);

    const res = await axios.post(
      `${BaseUrl}/employer/onboarding/video-upload/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Video Posted");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const getJobOnboardingApplicants = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];

  const res = await axios.get(`${BaseUrl}/employer/candidate-by-job/${jobId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });

  let arr = res.data.filter(function (e) {
    return e.status === "QUALIFIED";
  });

  return arr;
};

export const getOnbordingVideo = async (params) => {
  const jobId = params.queryKey[1];

  const res = await axios.get(`${BaseUrl}/employer/onboarding/video/${jobId}`, {
    headers: {
      apikey,
    },
  });
  return res.data;
};

export const postJobOnboardingFile = async (
  file,
  jobId,
  file_type,
  token,
  toast,
  setLoading
) => {
  try {
    const data = new FormData();
    data.append("file", file);
    data.append("job", jobId);
    data.append("file_type", file_type);

    const res = await axios.post(`${BaseUrl}/employer/onboarding/file/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("File Uploaded");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const postJobOnboardingQuestionResponse = async (
  token,
  jobId,
  data,
  toast,
  setLoading
) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/employer/onboarding/candidate-response-by-job/${jobId}`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Question response uploaded");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const getJobOnboardingQuestionResponse = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];
  const employeeId = params.queryKey[3];

  const res = await axios.get(
    `${BaseUrl}/employer/onboarding/candidate-response-by-job/${jobId}?employee=${employeeId}`,
    {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    }
  );

  return res.data;
};

export const getJobOnboardingFiles = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];
  const employeeId = params.queryKey[3];

  const res = await axios.get(
    `${BaseUrl}/employer/onboarding/file/?employee=${employeeId}&job=${jobId}`,
    {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    }
  );
  return res.data;
};

export const deleteJobOnboardingVideo = async (token, id, toast) => {
  try {
    const res = await axios.delete(
      `${BaseUrl}/employer/onboarding/video-delete/${id}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("Video Deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

export const getOnboardingFileTypes = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];

  const res = await axios.get(
    `${BaseUrl}/employer/onboarding/filetype/${jobId}`,
    {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    }
  );
  return res.data;
};

export const postOnboardingFileTypes = async (
  token,
  data,
  toast,
  setLoading
) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/employer/onboarding/filetype/`,
      data,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("File types uploaded");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const deleteOnboardingFileTypes = async (token, id, toast) => {
  try {
    const res = await axios.delete(
      `${BaseUrl}/employer/onboarding/delete-filetype/${id}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey,
        },
      }
    );
    toast("File type deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

//Resume
export const postResume = async (file, token, toast, setLoading) => {
  try {
    const data = new FormData();
    data.append("file", file);
    const res = await axios.post(`${BaseUrl}/employee/upload-resume/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Resume Uploaded");
    setLoading(false);
    return res.data;
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const getResumes = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/employee/resume/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const deleteResume = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/employee/delete-resume/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Resume Deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};
//Category
export const getCategories = async () => {
  const res = await axios.get(`${BaseUrl}/jobs/categories/`, {
    headers: {
      apikey,
    },
  });
  return res.data;
};

export const getHealthCategories = async () => {
  const res = await axios.get(`${BaseUrl}/jobs/health/categories/`, {
    headers: {
      apikey,
    },
  });
  return res.data;
};

export const setCategoriesInLocalStorage = async () => {
  try {
    const res1 = await axios.get(`${BaseUrl}/jobs/categories/`, {
      headers: {
        apikey,
      },
    });
    const res2 = await axios.get(`${BaseUrl}/jobs/health/categories/`, {
      headers: {
        apikey,
      },
    });
    localStorage.setItem("ATS_JobCategories", JSON.stringify(res1.data));
    localStorage.setItem("ATS_HealthJobCategories", JSON.stringify(res2.data));
  } catch (err) {
    console.log(err);
  }
};

//Company
export const postCompany = async (token, data, toast, setLoading, navigate) => {
  try {
    const res = await axios.post(`${BaseUrl}/employer/company/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Company Created");
    setLoading(false);
    navigate("/dashboard");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const patchCompany = async (
  token,
  data,
  id,
  toast,
  setLoading,
  navigate
) => {
  try {
    const res = await axios.patch(`${BaseUrl}/employer/company/${id}`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Company Updated");
    navigate("/dashboard");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const deleteCompany = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/employer/company/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Company Deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

export const getCompanies = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/employer/company/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getCompanyById = async (params) => {
  const token = params.queryKey[1];
  const companyId = params.queryKey[2];
  const res = await axios.get(`${BaseUrl}/employer/company/${companyId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

//Others
export const getTimezones = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/jobs/timezones/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  const mergeArr = res.data.flat(1);
  return mergeArr;
};

//DEI
export const getDeiText = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/dei/text/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getDeiImages = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/dei/images/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getDeiQuestions = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/dei/questions/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const postDeiQuestions = async (
  token,
  data,
  toast,
  setLoading,
  navigate
) => {
  try {
    const res = await axios.post(`${BaseUrl}/dei/answers/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Dei Quiz Done");
    setLoading(false);
    navigate("/dashboard/onboarding");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

export const getDeiStatsByJobId = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];
  const res = await axios.get(`${BaseUrl}/dei/stats-job/${jobId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getDeiStatsByCandidateId = async (params) => {
  const token = params.queryKey[1];
  const candidateId = params.queryKey[2];
  const res = await axios.get(`${BaseUrl}/dei/stats-candidate/${candidateId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getAllDeiData = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/dei/stats/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getDeiOrientations = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/user/orientations/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const getDeiRaces = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/user/races/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

export const postDeiRaceOrientation = async (
  token,
  data,
  toast,
  setLoading,
  navigate
) => {
  try {
    const res = await axios.patch(`${BaseUrl}/employee/data/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("DEI Race and Orientation submitted");
    setLoading(false);
    navigate("/dashboard/onboarding");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
  }
};

//CandidateSearchResume
export const getCandidateListSearch = async (
  filterString,
  setLoading,
  setError
) => {
  try {
    const res = await axios.get(
      `${BaseUrl}/employee/search-resume/?${filterString}`,
      {
        headers: {
          apikey,
        },
      }
    );
    setLoading(false);
    setError(false);
    return res.data;
  } catch (err) {
    console.log(err);
    setLoading(false);
    setError(true);
    return [];
  }
};

//GetCandidateResume
export const getCandidateResumes = async (params) => {
  const token = params.queryKey[1];
  const candidateId = params.queryKey[2];
  const res = await axios.get(
    `${BaseUrl}/employee/view-resume/${candidateId}`,
    {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    }
  );
  return res.data;
};

//Calendar

//POST Slot
export const postCreateSlot = async (token, data, toast, setLoading) => {
  try {
    const res = await axios.post(`${BaseUrl}/calender/slotbyjob/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Slot Created");
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
    return "FAILED";
  }
};

//GET Slot
export const getSlots = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];
  const res = await axios.get(`${BaseUrl}/calender/slotbyjob/${jobId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

//DELETE SLOT
export const deleteSlot = async (token, id, toast) => {
  try {
    const res = await axios.delete(`${BaseUrl}/calender/slot/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Slot Deleted");
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    return "FAILED";
  }
};

//GET Slot Candidates
export const getSlotCandidates = async (params) => {
  const token = params.queryKey[1];
  const jobId = params.queryKey[2];
  const res = await axios.get(`${BaseUrl}/calender/getschedule/${jobId}`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

//Book Slot
export const bookSlot = async (token, data, toast, setLoading) => {
  try {
    const res = await axios.post(`${BaseUrl}/calender/schedule/`, data, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast(
      "You have successfully booked the slot, please head to the view schedule section to get details."
    );
    setLoading(false);
    return "SUCCESS";
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
    setLoading(false);
    return "FAILED";
  }
};

//Candidate Schedule
export const getCandidateSchedule = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/calender/myschedule/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

//Set Subscription Details
export const setSubscriptionDetails = async (token, dispatch) => {
  try {
    const res = await axios.get(`${BaseUrl}/employer/subscription/`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });

    let data = res.data;
    if (data?.permissions) {
      let arr = [];
      for (let i = 0; i < data.permissions.length; i++) {
        arr.push(data.permissions[i].permission.id);
      }
      data.permissionIdList = [...arr];
    }

    dispatch({
      type: "SET_SUBSCRIPTION",
      payload: !data.data ? null : data,
    });
  } catch (err) {
    console.log(err);
  }
};

//Get Subscriptions
export const getSubscriptions = async () => {
  const res = await axios.get(`${BaseUrl}/subscription/`, {
    headers: {
      apikey,
    },
  });

  return res.data;
};

//Add Employer
export const addEmployer = async (req, toast, setLoading, navigate) => {
  try {
    const res = await axios.post(`${BaseUrl}/user/register/`, req, {
      headers: {
        apikey,
      },
    });
    toast("User Created");
    navigate("/profile/viewemployers");
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

//Get All Employers
export const getEmployers = async (params) => {
  const token = params.queryKey[1];
  const res = await axios.get(`${BaseUrl}/user/employers/get/`, {
    headers: {
      Authorization: `Token ${token}`,
      apikey,
    },
  });
  return res.data;
};

//PATCH EMPLOYER
export const patchEmployer = async (token, req, toast) => {
  try {
    const res = await axios.post(`${BaseUrl}/user/edit-member/`, req, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("User type changed");
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  } finally {
    return "";
  }
};

//DELETE EMPLOYER
export const deleteEmployer = async (token, req, toast) => {
  try {
    const res = await axios.post(`${BaseUrl}/user/delete-member/`, req, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("User Deleted");
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  } finally {
    return "";
  }
};

//Post Subscription
export const postSubscription = async (req, token, toast, navigate) => {
  try {
    const res = await axios.post(`${BaseUrl}/subscription/add/`, req, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    toast("Subscription Selected");
    navigate("/profile/currentplan");
  } catch (err) {
    console.log(err);
    toast(
      err.response?.data?.message || "Something went wrong. Please try again."
    );
  }
};

//Get API Key
export const getApikey = async (token) => {
  try {
    const res = await axios.get(`${BaseUrl}/user/generatekey/`, {
      headers: {
        Authorization: `Token ${token}`,
        apikey,
      },
    });
    return res.data;
  } catch (err) {
    console.log(err);
    return "FAILED";
  }
};

//Post API Key
export const postApikey = async (token) => {
  try {
    const res = await axios.post(
      `${BaseUrl}/user/generatekey/`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey: apikey,
        },
      }
    );

    return res.data;
  } catch (err) {
    console.log(err);
    return "FAILED";
  }
};




//submit KYC
export const submitKYCData = async (token,documentNumber, selectedFile, selectedID, otherDocument) => {
  try {
    const formData = new FormData();
    formData.append("kycNumber", documentNumber);
    formData.append("file", selectedFile);

    if (selectedID === "Others...") {
      formData.append("kycType", otherDocument);
    } else {
      formData.append("kycType", selectedID);
    }

    // const response = await axios.post("/user/kyc", formData);

    const response = await axios.post(
      `${BaseUrl}/user/kyc/`,
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          apikey: apikey,
        },
      }
    );
    console.log(response.data);

  } catch (error) {
    console.error("Error:", error);

  }
};







