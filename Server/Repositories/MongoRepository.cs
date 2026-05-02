using MongoDB.Driver;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System;

namespace Server.Repositories
{
    public class MongoRepository<T> : IMongoRepository<T> where T : class
    {
        private readonly IMongoCollection<T> _collection;

        public MongoRepository(IMongoClient client, string collectionName)
        {
            var database = client.GetDatabase("SunfireDB");
            _collection = database.GetCollection<T>(collectionName);
        }

        public async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _collection.Find(_ => true).ToListAsync();
        }

        public async Task<T?> GetByIdAsync(string id, string idFieldName = "Id")
        {
            var filter = Builders<T>.Filter.Eq(idFieldName, id);
            return await _collection.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<T?> FindOneAsync(Expression<Func<T, bool>> filterExpression)
        {
            return await _collection.Find(filterExpression).FirstOrDefaultAsync();
        }

        public async Task InsertAsync(T entity)
        {
            await _collection.InsertOneAsync(entity);
        }

        public async Task ReplaceOneAsync(string id, T entity, string idFieldName = "Id", bool isUpsert = false)
        {
            var filter = Builders<T>.Filter.Eq(idFieldName, id);
            await _collection.ReplaceOneAsync(filter, entity, new ReplaceOptions { IsUpsert = isUpsert });
        }

        public async Task DeleteAsync(string id, string idFieldName = "Id")
        {
            var filter = Builders<T>.Filter.Eq(idFieldName, id);
            await _collection.DeleteOneAsync(filter);
        }
    }
}
