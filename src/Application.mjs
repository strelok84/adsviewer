import awilix from 'awilix';
const { asFunction, asValue } = awilix;
import DataSourceFactory from './database/DataSourceFactory';

export default class Application {
  constructor() {
    this.container = null;
  }

  /**
   * initialize application
   */
  async createContainer() {
    this.container = awilix.createContainer();
    // register currentUser, datasource
    this.container.register({
      currentUser: asValue(process.env.USER),
      dataSource: asFunction(DataSourceFactory)
    });

    // autoscan modules
    await this.container.loadModules(['src/repositories/**/*.mjs', 'src/usecases/**/*.mjs'], {
      formatName: 'camelCase',
      esModules: true
    });
  }

  /**
   * create scope for http request
   * @param {*} req
   */
  async createScope(req) {
    if (this.container == null) {
      await this.createContainer();
    }
    // console.log(this.container);

    const xRemoteUser = req && req.headers && req.headers['x-remote-user'];
    const currentUser = xRemoteUser || process.env.USER;

    const scope = this.container.createScope();
    scope.register({ currentUser });

    return scope;
  }

  /**
   * resolve bean by name
   * @param {*} name name of bean
   */
  resolve(name) {
    return this.container.resolve(name);
  }
}

