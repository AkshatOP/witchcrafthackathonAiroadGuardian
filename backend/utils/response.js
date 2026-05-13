const meta = () => ({ timestamp: new Date().toISOString(), version: '1.0' });

export const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, error: null, meta: meta() });
};

export const errorResponse = (res, code, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: { code, message },
    meta: meta(),
  });
};
