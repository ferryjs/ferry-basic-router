'use strict';

import BasicRouter from 'router';
import finalHandler from 'finalhandler';
import http from 'http';

import {Router} from 'ferry';

class BasicRouterAdapter extends Router {

  constructor(config = {}) {
    super(config);
    this.name = 'Basic Router';
    this.app = new BasicRouter();
  }

  route(action, resource) {

    let collection = this.ferry.storage.models[resource.toLowerCase()];

    // @todo Remove Waterline dependency.
    switch (action) {

      case 'index':
        return (req, res)=> {
          collection.find().exec(function(err, models) {
            if(err) return res.json(JSON.stringify({ err: err }), 500);

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(models));
          });
        };
        break;

      case 'view':
        return (req, res)=> {
          collection.findOne({ id: req.params.id }, function(err, model) {
            if(err) return res.end(JSON.stringify({ err: err }), 500);

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(model));
          });
        };
        break;

      case 'create':
        return (req, res)=> {
          collection.create(req.body, function(err, model) {
            if(err) return res.end(JSON.stringify({ err: err }), 500);

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(model));
          });
        };
        break;

      case 'update':
        return (req, res)=> {
          // Don't pass ID to update
          delete req.body.id;

          collection.update({ id: req.params.id }, req.body, function(err, model) {
            if(err) return res.end(JSON.stringify({ err: err }), 500);
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(model));
          });
        };
        break;

      case 'delete':
        return (req, res)=> {
          collection.destroy({ id: req.params.id }, function(err) {
            if(err) return res.end(JSON.stringify({ err: err }), 500);

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end('{"status": "ok"}');
          });
        };
        break;

      default:
        // Look for overriden handler actions
        break;

    }

  }

  initialize(basePath, routes, callback) {

    let self = this;
    let basicRouter = new BasicRouter();

    // @todo Rework routes definition.
    for (let resource in routes) {

      let resourceRouter = new BasicRouter();
      let basePath = routes[resource].basePath;

      for (let action in routes[resource].actions) {

        let method = routes[resource].actions[action].method;
        let route = routes[resource].actions[action].route;

        resourceRouter[method](route, function (req, res) {
          self.route(action, resource)(req, res);
        });

      }

      basicRouter.use(basePath, resourceRouter);

    };

    this.app.use(basePath, basicRouter);

  }

  start(port = 3000, callback) {

    let self = this;

    http.createServer(function(req, res) {
      self.app(req, res, finalHandler(req, res))
    }).listen(port, callback);

  }

}

export default BasicRouterAdapter;
