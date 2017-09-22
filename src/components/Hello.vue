<template>
  <div class="el-hello">
      <p class="el-hello__msg">{{ msg }}</p>
      <button>start</button>
  </div>
</template>

<script>
    import { mixinHullMethod, requestHull, waitCall } from '../common/hull';

    export default {
        name : 'hello',
        mixins : [mixinHullMethod],
        data() {
            return {
                msg : 'Welcome to Your Vue.js App'
            };
        },
        async mounted() {
            console.log(this);
            this.bindMethods({ saveInfo : 'saveInfo' });
            const msg = await waitCall('testHullCall');
            console.log(msg);
        },
        methods : {
            async saveInfo(data) {
                console.log(this);
                console.log(data);
                const res = await requestHull('saveMsg', { age : 10 });
                console.log(res);
            }
        }
    };
</script>

<style>
    @component-namespace el{
        @b hello{
            text-align: center;
            @utils-vertical-center;
            height: 400px;
            overflow: hidden;
            @e msg{
                display: inline-block;
                height: 100%;
                font-size: 30px 1;
            }
        }
    }
</style>
