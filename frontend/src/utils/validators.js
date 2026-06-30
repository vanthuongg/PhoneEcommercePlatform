export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPhoneNumber = (phone) => {
  // Simple validation for 10 to 11 digit numbers
  const re = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return re.test(String(phone));
};
