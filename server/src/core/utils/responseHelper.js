export const success = (res, data, message = 'Success') =>
  res.json({ success: true, message, data });

export const created = (res, data, message = 'Created') =>
  res.status(201).json({ success: true, message, data });

export const noContent = (res) => res.status(204).end();

export const paginated = (res, { data, page, limit, total }) =>
  res.json({
    success: true,
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
