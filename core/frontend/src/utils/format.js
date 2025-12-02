// utils/format.js
export const maskIDCard = (id) => {
  if (!id) return '';
  return id.replace(/^(.{4})(?:\d+)(.{3})$/, "$1**********$2");
}

export const maskPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/^(.{3})(?:\d+)(.{4})$/, "$1****$2");
}

export const maskEmail = (email) => {
  if (!email) return '';
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return email;
  
  const prefix = email.substring(0, atIndex);
  const domain = email.substring(atIndex);
  
  if (prefix.length <= 2) {
    return prefix + '***' + domain;
  }
  
  const firstTwo = prefix.substring(0, 2);
  const lastOne = prefix.substring(prefix.length - 1);
  return `${firstTwo}****${lastOne}${domain}`;
}
