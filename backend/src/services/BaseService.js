class BaseService {
  constructor(Model) {
    this.Model = Model;
  }
  list = (where = {}, opts = {}) => this.Model.findAll({ where, ...opts });
  paged = async ({ page = 1, limit = 10, where = {}, include = [], order = [['createdAt','DESC']] }) => {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.Model.findAndCountAll({ where, include, order, limit, offset });
    return {
      status: 'success',
      totalRecords: count,
      totalPages: Math.ceil(count / limit) || 1,
      currentPage: page,
      items: rows,
    };
  };
  get = (id, opts = {}) => this.Model.findByPk(id, opts);
  create = (data) => this.Model.create(data);
  update = async (id, data) => {
    const row = await this.Model.findByPk(id);
    if (!row) return null;
    await row.update(data);
    return row;
  };
  delete = async (id) => {
    const row = await this.Model.findByPk(id);
    if (!row) return null;
    await row.destroy();
    return true;
  };
}
module.exports = BaseService;
