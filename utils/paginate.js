module.exports = async function paginate(model, req, where = {}, extra = {}) {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(parseInt(req.query.limit || "10", 10), 100);
  const offset = (page - 1) * limit;

  const { rows, count } = await model.findAndCountAll({
    where,
    limit,
    offset,
    ...extra,
  });

  return {
    status: "success",
    totalRecords: count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    items: rows,
  };
};
