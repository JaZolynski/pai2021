const db = require('./db')
const lib = require('./lib')

const project = module.exports = {

    handle: function(env) {

   

        const validate = function(project) {
            let result = { managerID: project.manager,  name: project.name}
            return result.managerID && result.name ? result : null
        }
        

      

        let _id, project
        let q = env.urlParsed.query.q ? env.urlParsed.query.q : ''
        let skip = env.urlParsed.query.skip ? parseInt(env.urlParsed.query.skip) : 0
        skip = isNaN(skip) || skip < 0 ? 0 : skip
        let limit = env.urlParsed.query.limit ? parseInt(env.urlParsed.query.limit) : 0
        limit = isNaN(limit) || limit <= 0 ? 999999 : limit

        const sendAllProjects = function(q = '') {
            db.projects
            .aggregate(
                [{
                    $lookup: {
                        from: "users",
                        localField: "manager",
                        foreignField: "_id",
                        as: "users",
                        
                    }
                }],
                    
            )
            .toArray(function (err, projects) {
              if (!err) {
                lib.sendJson(env.res, projects);
              } else {
                lib.sendError(env.res, 400, "projects failed " + err);
              }
            });          
        }

        if(env.req.method == 'POST' || env.req.method == 'PUT') {
            project = validate(env.payload)
            if(!project) {
                lib.sendError(env.res, 400, 'invalid project')
                return
            }
        }

        switch(env.req.method) {
            case 'GET':
                _id = db.ObjectId(env.urlParsed.query._id)
                if(_id) {
                    db.projects.findOne({ _id }, function(err, result) {
                        lib.sendJson(env.res, result)
                    })
                } else {
                    sendAllProjects(q)
                }
                break
            case 'POST':
                db.projects.insertOne(project, function(err, result) {
                    if(!err) {
                        
                    } else {
                        lib.sendError(env.res, 400, 'persons.insertOne() failed')
                    }
                })
                break
            case 'DELETE':
                _id = db.ObjectId(env.urlParsed.query._id)
                if(_id) {
                    db.persons.findOneAndDelete({ _id }, function(err, result) {
                        if(!err) {
                            sendAllPersons(q)
                        } else {
                            lib.sendError(env.res, 400, 'persons.findOneAndDelete() failed')
                        }
                    })
                } else {
                    lib.sendError(env.res, 400, 'broken _id for delete ' + env.urlParsed.query._id)
                }
                break
            case 'PUT':
                _id = db.ObjectId(env.payload._id)
                if(_id) {
                    db.persons.findOneAndUpdate({ _id }, { $set: person }, { returnOriginal: false }, function(err, result) {
                        if(!err) {
                            sendAllPersons(q)
                        } else {
                            lib.sendError(env.res, 400, 'persons.findOneAndUpdate() failed')
                        }
                    })
                } else {
                    lib.sendError(env.res, 400, 'broken _id for update ' + env.urlParsed.query._id)
                }
                break
            default:
                lib.sendError(env.res, 405, 'method not implemented')
        }
    }
}