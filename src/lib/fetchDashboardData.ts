export const fetchDashboardData = async () => {
  const apiUrl = import.meta.env.VITE_SHEET_API_URL;
  const res = await fetch(apiUrl);
  return res.json();
};
