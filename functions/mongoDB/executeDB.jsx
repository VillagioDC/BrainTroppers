// FUNCTION TO EXECUTE MONGODB OPERATIONS

// Functions
const openDBCollection = require('./openDBCollection.jsx');
const closeDBCollection = require('./closeDBCollection.jsx');
const log = require('../utils/log.jsx');

/* PARAMETERS
   operation {object}
   operation.collectionName {string} - Name of the collection
   operation.type {string} - Type of operation: findOne, findMany, insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany)
   operation.filter {Object} - Filter criteria for find, update, or delete operations (details and examples below)
   operation.update {Object} - Update data for update operations
   operation.document {Object} or [Object] - Document to insert for insert operations
   operation.options {Object} - Options for the operation (e.g., projection, sort, limit - details and examples below)
   RETURN {Object} || null - Result of the operation or null
*/

async function executeDB(operation) {

    let db;

    try {
        // Open the database connection
        db = await openDBCollection(operation.collectionName);
        if (!db) {
            log("SERVER ERROR", "Unable to open MongoDB connection in executeDB.");
            return null;
        }
        
        let result;

        // Perform the requested operation
        switch (operation.type) {
            // Find one document
            case 'findOne':
                result = await db.collection.findOne(
                    operation.filter || {},
                    operation.options || {}
                );
                break;
            // Find multiple documents
            case 'findMany':
                result = await db.collection.find(
                    operation.filter || {},
                    operation.options || {}
                ).toArray();
                break;
            // Insert one document
            case 'insertOne':
                result = await db.collection.insertOne(
                    operation.document,
                    operation.options || {}
                );
                break;
            // Insert multiple documents
            case 'insertMany':
                result = await db.collection.insertMany(
                    operation.documents,
                    operation.options || {}
                );
                break;
            // Replace one document (entire)
            case 'replaceOne':
                result = await db.collection.replaceOne(
                    operation.filter || {},
                    operation.replacement || {},
                    operation.options || {}
                );
                break;
            // Update one document
            case 'updateOne':
                result = await db.collection.updateOne(
                    operation.filter || {},
                    operation.update || {},
                    operation.options || {}
                );
                break;
            // Update multiple documents
            case 'updateMany':
                result = await db.collection.updateMany(
                    operation.filter || {},
                    operation.update || {},
                    operation.options || {}
                );
                break;
            // Delete one document
            case 'deleteOne':
                result = await db.collection.deleteOne(
                    operation.filter || {},
                    operation.options || {}
                );
                break;
            // Delete multiple documents
            case 'deleteMany':
                result = await db.collection.deleteMany(
                    operation.filter || {},
                    operation.options || {}
                );
                break;
            default:
                throw new Error(`Unsupported operation type: ${operation.type}`);
        }

        // Return successful result
        return result;

    // Catch errors
    } catch (error) {
        // Log the error
        log("SERVER ERROR", `Error during MongoDB operation: ${operation.type} on ${operation.collectionName}`, error);

        // Return failure result
        return null;

    // Always close the database connection
    } finally {
        // If was connected
        if (db) {
            // Close the database connection
            try {
                await closeDBCollection(db);
            // Catch error
            } catch (closeError) {
                log("SERVER ERROR", `Error closing DB connection after ${operation.type} on ${operation.collectionName}`, closeError);
            }
        }
    }
}

module.exports = executeDB;

/* PRACTICAL USAGE
    CONFIG.FILTER
    use this to define search criteria for documents
    applies to find update and delete operations
    EXAMPLES:
    - find all users with status active { status: "active" }
    - update a user by id { _id: ObjectId("...") }
    - delete logs older than a date { createdAt: { $lt: new Date("2023-01-01") } }
    - find products priced between 50 and 200 { price: { $gte: 50, $lte: 200 } }
    - select logs from last 7 days { timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    - filter users with age over 18 { age: { $gt: 18 } }
    - find products with specific tags { tags: { $in: ["electronics", "gadgets"] } }
    - match documents where colors include red and blue { colors: { $all: ["red", "blue"] } }
    - select orders with at least 3 items { itemCount: { $gte: 3 } }
    - filter users with specific address city { "address.city": "New York" }
    - find products in category with subcategory { "category.main": "electronics", "category.sub": "smartphones" }
    - find active users or premium members { $or: [ { status: "active" }, { membership: "premium" } ] }
    - exclude deleted items { isDeleted: { $ne: true } }
    - combine multiple conditions for orders { status: "shipped", total: { $gt: 100 }, paymentMethod: "credit_card" }
    - find articles containing "climate change" { content: { $regex: "climate change", $options: "i" } }
    - search users by partial email match { email: { $regex: "gmail.com", $options: "i" } }
    - find documents missing a field { phone: { $exists: false } }
    - select users with verified emails { "email.verified": true }
    - delete audit logs older than 1 year { timestamp: { $lt: new Date("2022-01-01") } }
    - find events scheduled between dates { date: { $gte: new Date("2023-12-01"), $lte: new Date("2023-12-31") } }
    - find locations within 10km of coordinates { location: { $geoWithin: { $centerSphere: [ [ -73.935242, 40.730610 ], 10 / 6378.1 ] } } }
    - 
    use mongodb query operators like $eq $in $gte $regex for advanced filtering

    CONFIG.UPDATE
    defines changes to apply in update operations
    used in updateOne and updateMany
    must include update operators like $set $inc $push $unset
    EXAMPLES:
    - set a new status { $set: { status: "completed" } }
    - increment a counter { $inc: { attempts: 1 } }
    - add to an array { $push: { tags: "urgent" } }
    - remove a field { $unset: { phoneNumber: "" } }
    - update multiple fields { $set: { status: "resolved", resolutionNote: "User confirmed fixed" } }
    - upload if lower than current { $min: { priority: 2 } }
    - remove item from an array (tags) { $pull: { tags: "low priority" } }
    - add item to an array if not exists { $addToSet: { tags: "feature request" } }
    - change embeded element { $set: { "shippingAddress.city": "New York" } }
    - record last activity time { $currentDate: { lastActive: true } }
    - rename element tabel (fullName to Name) { $rename: { fullName: "name" } } - fullName: "John Doe" -> name: "John Doe"
    - multiply value { $mul: { inventory: 2 } }
    - increment down { $inc: { availableSeats: -1 } }
    - mix multiple update operations in one call { $set: { status: "in progress" }, $currentDate: { lastUpdated: true }, $inc: { attempts: 1 } }

    COMPLEX FILTERING
    - finding documents with specific array elements
        EXAMPLE 1: find all products where any feature has name "color"
        filter: { "features.name": "color" }
        projection in options: { projection: { "features.$": 1 } }
        EXAMPLE 2: find user with at least one address in "new york"
        filter: { "addresses.city": "new york" }
        projection: { "addresses.$": 1 }
    - updating specific array elements
        EXAMPLE 1: update the value of a feature named "color" in a product
        filter: { _id: ObjectId("...") }
        update: { set: { "features.[elem].value": "red" } }
        options: { arrayFilters: [ { "elem.name": "color" } ] }
        EXAMPLE 2: increment the quantity of a specific item in an order
        filter: { orderId: "123" }
        update: { inc: { "items.[item].quantity": 1 } }
        options: { arrayFilters: [ { "item.productId": "p456" } ] }
        EXAMPLE 3: add a tag to a specific blog post category
        filter: { postId: "abc" }
        update: { push: { "categories.[cat].tags": "tutorial" } }
        options: { arrayFilters: [ { "cat.name": "mongodb" } ] }

    CONFIG.OPTIONS
    optional settings for operations
    EXAMPLES:
    - projection in find { projection: { name: 1 email: 0 } }
    - sort order { sort: { createdAt: -1 } }
    - limit results { limit: 10 }
    - upsert flag for updates { upsert: true }
    - write concern { writeConcern: { w: "majority" } }
    for insert operations options can include ordered: false for bulk inserts

    PRACTICAL TIPS
    leverage projection to reduce data transfer in find operations
    test filters with small datasets first to ensure accuracy
    use upsert cautiously to avoid duplicate entries
    combine operators like $and $or for complex queries
    for time-based operations ensure date formats are consistent across your application

    COMMON MISTAKES
    missing update operators in config.update causing full document replacement
    empty filters leading to unintended updates/deletes
    incorrect projection syntax causing unexpected data exposure
    misusing options like limit in update/delete operations where it may not apply
    forgetting to handle ObjectIds properly when working with _id fields
*/