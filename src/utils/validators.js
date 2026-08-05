import validator from 'validator';

const validateEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    throw new Error('Invalid email address');
  }
  return true;
};

const validatePassword = (password) => {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    throw new Error('Password must contain at least one number');
  }
  return true;
};

const validateFileUpload = (file, allowedMimes, maxSize) => {
  if (!file) {
    throw new Error('No file provided');
  }
  
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error(`File type ${file.mimetype} not allowed`);
  }
  
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }
  
  return true;
};

const validateDocumentInput = (data) => {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Valid title is required');
  }
  
  if (data.title.length < 3) {
    throw new Error('Title must be at least 3 characters');
  }
  
  if (data.title.length > 255) {
    throw new Error('Title must not exceed 255 characters');
  }
  
  return true;
};

const validateFlashcard = (data) => {
  if (!data.front || typeof data.front !== 'string') {
    throw new Error('Front text is required');
  }
  
  if (!data.back || typeof data.back !== 'string') {
    throw new Error('Back text is required');
  }
  
  if (data.front.length < 1 || data.front.length > 1000) {
    throw new Error('Front text must be between 1 and 1000 characters');
  }
  
  if (data.back.length < 1 || data.back.length > 5000) {
    throw new Error('Back text must be between 1 and 5000 characters');
  }
  
  return true;
};

const validateQuizInput = (data) => {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Quiz title is required');
  }
  
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error('At least one question is required');
  }
  
  return true;
};

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.trim(validator.escape(input));
  }
  if (typeof input === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

export {
  validateEmail,
  validatePassword,
  validateFileUpload,
  validateDocumentInput,
  validateFlashcard,
  validateQuizInput,
  sanitizeInput
};