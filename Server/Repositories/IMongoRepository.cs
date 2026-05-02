using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System;

namespace Server.Repositories
{
    public interface IMongoRepository<T> where T : class
    {
        Task<IEnumerable<T>> GetAllAsync();
        Task<T?> GetByIdAsync(string id, string idFieldName = "Id");
        Task<T?> FindOneAsync(Expression<Func<T, bool>> filterExpression);
        Task InsertAsync(T entity);
        Task ReplaceOneAsync(string id, T entity, string idFieldName = "Id", bool isUpsert = false);
        Task DeleteAsync(string id, string idFieldName = "Id");
    }
}
