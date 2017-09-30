/**
 * @fileOverview 适用于vue组件与外层iframe通信。
 * 使用场景，外层A页面通过iframe加载了vue组件B页面，A要给B发消息，或者B要给A发消息。
 *
 *  在B中通过requestHull(method, data)方法，调用A中的method方法，并传递data数据。该方法返回一个Promise，
 *  当有回调时，会resolve Promise。但是，建议A页面method方法应该始终执行回调函数，以便Promise释放资源。
 *
 *  在A中要先B发消息时，B应该先在window上注册一个方法，以便A调用。
 *  可以在B中通过调用waitCall(method)在window上注册一个method方法，该方法返回一个Promise。当method方法被执行时，会resolve
 *  Promise。注意：该方法只会被监听一次，当回调完成时，注册在window上的方法就会被删除。
 *
 *  也可以选择使用mixins选项混入mixinHullMethod。在组件的mounted之后，调用bindMethods（methods）来注册批量的方法，这里
 *  方法会始终存在该组件的生命周期中。methods是一个key-value的Object，其中key为注册的方法，value为key方法被执行后的回调
 *  方法。
 *  @example
 *  <script>
 *  import { mixinHullMethod, requestHull, waitCall } from '../common/hull';

    export default {
        name : 'hello',
        mixins : [mixinHullMethod],
        data() {
            return {
                msg : 'Welcome to Your Vue.js App'
            };
        },
        async mounted() {
            this.bindMethods({ saveInfo : 'saveInfo' }); // 注册生命周期内始终存在的存在的方法
            const msg = await waitCall('testHullCall'); // 注册一个只会被调用一次的方法。
        },
        methods : {
            async saveInfo(data) {
                const res = await requestHull('saveMsg', { age : 10 }); // 请求父iframe的方法
            }
        }
    };
 *  </script>
 *
 *  liaoct备注： 后续可以考虑加入vuex store的支持。
 */

const namespace = 'Hull';

const getValueByPath = function (object, prop) {
    prop = prop || '';
    const paths = prop.split('.');
    let current = object;
    let result = null;
    for (let i = 0, j = paths.length; i < j; i++) {
        const path = paths[i];
        if (!current) break;

        if (i === j - 1) {
            result = current[path];
            break;
        }
        current = current[path];
    }
    return result;
};

export const waitCall = method => new Promise(resolve => {
    if (!window) return;
    if (!window[namespace]) window[namespace] = {};
    window[namespace][method] = function (data) {
        delete window[namespace][method];
        resolve(data);
    };
});

export const requestHull = (method, data, wait) => {
    if (!window || !method || typeof method !== 'string') return null;
    let curWin = window;
    let parent = curWin.parent;
    while (parent !== curWin && !getValueByPath(parent, method)) {
        curWin = parent;
        parent = parent.parent;
    }
    const func = getValueByPath(parent, method);
    if (!func && typeof func !== 'function') return null;
    if (wait) {
        return new Promise((resolve, reject) => {
            func(data, results => resolve(results), err => reject(err));
        });
    }
    return func(data);
};

export const mixinHullMethod = {
    data() {
        return { nmspace : namespace };
    },
    methods : {
        bindMethods(methods) {
            const self = this;
            self._bindMethods = methods;
            const namespace = this.nmspace;
            if (!window[namespace]) window[namespace] = {};
            Object.keys(methods).forEach(name => {
                window[namespace][name] = function (...args) {
                    self[methods[name]](...args);
                };
            });
        }
    },
    destroyed() {
        const methods = this._bindMethods;
        const namespace = this.nmspace;
        if (!window[namespace]) return;
        Object.keys(methods).forEach(name => {
            delete window[namespace][name];
        });
    }
};

