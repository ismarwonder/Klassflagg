// utils.js

const validateUsername = (username) => {
  if (!username) {
    alert('Var god ange ditt namn.');
    return false;
  }
  return true;
};

const validateTeacherPassword = (password, TEACHER_PASSWORD) => {
  if (password !== TEACHER_PASSWORD) {
    alert('Fel lösenord. Var god försök igen.');
    return false;
  }
  return true;
};

const validateSessionCode = (sessionCode) => {
  if (!sessionCode) {
    alert('Var god ange sessionskoden.');
    return false;
  }
  return true;
};

/**
 * @param {Object} users 
 * @returns {Object}
 */
const countFlags = (users) => {
  return Object.values(users).reduce(
    (acc, user) => {
      if (user.flag === FLAG_STATES.GREEN) acc.greenCount += 1;
      else acc.redCount += 1;
      return acc;
    },
    { greenCount: 0, redCount: 0 }
  );
};

const generateSessionCode = () => {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
};

export {
  validateUsername,
  validateTeacherPassword,
  validateSessionCode,
  generateSessionCode,
  countFlags
};