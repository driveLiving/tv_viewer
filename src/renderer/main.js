import Vue from "vue"

import iView from 'iview';
import 'iview/dist/styles/iview.css';    // 使用 CSS
import App from "./App.vue"
import router from "./router"
const { exec } = require("child_process")
import axios from 'axios'


window.Hls = require('hls.js');

Vue.prototype.$axios = axios
Vue.use(iView);

Vue.prototype.$startLoading = function(loadStr) {
  var loadingObject = this.$loading({
    lock: true,
    text: loadStr || "Loading ...",
    spinner: "el-icon-loading",
    background: "rgba(0, 0, 0, 0.7)"
  })
  return loadingObject
}

Vue.prototype.$execCmd = function(cmdStr, loadingStr, resultName) {
  // final result
  let result
  // start loading animation
  loadingStr = loadingStr || "loading"
  let loadingObject = this.$startLoading(loadingStr)
  
  // start exec
  exec(cmdStr, (error, stdout, stderr) => {
    // error happened
    if (error) {
      console.log("get a error: " + error)
      result = error
      loadingObject.close()
      // feedback
      this[resultName] = result
      return
    }

    // no error
    console.log(stdout)
    console.log(stderr)
    result = stdout + "\n" + stderr
    // stop loading animation
    loadingObject.close()
    // feedback
    this[resultName] = result
  })
}

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  components: {
    App
  },
  template: "<App/>"
})
