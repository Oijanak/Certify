const token = localStorage.getItem("token");
export const loadUser = async () => {
  const res = await fetch("http://localhost:5000/api/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return res;
};
