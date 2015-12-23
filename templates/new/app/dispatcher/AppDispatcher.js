let { Dispatcher } = require('flux');

/**
 * Dispatch Actions
 * @class  AppDispatcher action The data coming from the view.
 * @extends Dispatcher
 */
class AppDispatcher extends Dispatcher {
  /**
   * A bridge function between the views and the dispatcher, marking the action
   * as a view action.  Another variant here could be handleServerAction.
   * @param  {object} action The data coming from the view.
   */
  handleViewAction(action) {
    var payload = {
      source: 'VIEW_ACTION',
      action: action,
    };
    this.dispatch(payload);
  }

  /**
   * @param {object} action The details of the action, including the action's
   * type and additional data coming from the server.
   */
  handleServerAction(action) {
    var payload = {
      source: 'SERVER_ACTION',
      action: action,
    };
    this.dispatch(payload);
  }
}

module.exports = new AppDispatcher();
