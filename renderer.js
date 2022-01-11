// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.



function vue_stuff(){

    document.addEventListener("DOMContentLoaded", function () {
  
      document.getElementById("app").append(
          jth.parse(
              {
                  t:"div",
                  class: "content", 
                  c: [
                      {
                          t: "button",
                          c: [
                              {
                                  "v-html": "(bool) ? 'true' : 'false'"
                              },   
                          ],
                          "v-on:click": "bool = !bool"
                      },
                      {
                          t: "div", 
                          class: "inputs", 
                          c: [                                
                              {
                                  "v-for": "(value, key) in arr", 
                                  "v-model": "arr[key].val",
                                  "t": "input", 
                                  "type": "range", 
                                  "min": "0", 
                                  "max": "1", 
                                  "step": "0.01"
                              }
                          ]
                      }, 
                      {
                          "t": "h1", 
                          "c": "use ctrl+z for un-do, ctrl+shift+z for re-do"
                      }
  
                  ]
              }, 
          )
      );
  
  
  
  
          window.vueObject = new Vue({
              el: '#app',
              data: {
                  development: false, 
                  bool: false, 
                  arr: [
                      {
                          "val": 1,
                      },
                      {
                          "val": 2,
                      },
                      {
                          "val": 3,
                      },
                      {
                          "val": 4,
                      }
                  ],
                  url_b64_separator: "#",
                  url_b64_prop: "b64_json", 
                  url_b64_assignment_character: "=", 
                  undo_redo_used : false, 
                  data_to_b64_ignore_props: [
                      "gl", 
                      "overlay_canvas", 
                      "image", 
                      "data_history",
                      "data_history_index",
                      "uniform4fv_rgba_intensity_location", 
                      "reset_history"
                  ], 
                  reset_history: false, 
                  data_history: [
  
                  ],
                  data_history_index: 0, 
                  data_change : false, 
  
              },
              updated: function(){
  
                  console.log("updated");
  
                  var self = this;
  
                  self.data_change = true;
  
                  self.write_b64_to_url();
                                  
              },
              mounted: function () {
  
                  var self = this;
  
                  this.read_b64_from_url();
  
                  //add first b64 to history
                  this.reset_or_update_history_if_data_change();
  
                  console.warn("!IMPORTANT: you are using write_b64_to_url, please set .development to true, to prevent unexpected behaviour in development, since vue _data will be stored and loaded from url")
  
  
                  window.onmouseup = function(){
                      //console.log(self.data_change);
                      self.reset_or_update_history_if_data_change();
                  }
                  window.onkeyup = function(){
                      self.reset_or_update_history_if_data_change();
                  }
  
                  window.onkeyup = function(event) {
  
                      // if ctrl + z
                      if(event.ctrlKey && event.which == 90){
                          // if ctrl + shift + z
                          if(event.shiftKey){
                              if(self.data_history_index < self.data_history.length-1){
                                  self.data_history_index++;
                              }
                          }
                          // if only ctrl + z
                          if(!event.shiftKey){
                              if(self.data_history.length > 1 && self.data_history_index > 0){
                                  self.data_history_index--;
                              }
                          }
  
                          self.undo_redo_used = true;
                          var b64_string = self.data_history[self.data_history_index];
                          var data = self.b64_to_data(b64_string);
                          self.apply_data_copy_to_data(data);
                          
                      }
                  }
  
              },
              watch: {
                  "data": {
                      handler: function(a,b,c,d){
                          console.log(a,b,c,d);
                      },
                      deep: true, 
                  }
              },
              methods: {
                  reset_or_update_history_if_data_change: function(){
                      var self = this;
                      
                      // reset the history if user updated changes 'manually' (without using ctrl+z)
                      if(!self.undo_redo_used){ 
                          console.log("reset history");
                          self.data_history = self.data_history.slice(0, self.data_history_index+1);
                          self.undo_redo_used = false; 
                      }
  
                      if(self.data_change){
                          
                          window.setTimeout(function(){
  
                              self.write_b64_to_history();
                              self.data_change = false; 
  
                          },10);
                      }
                  }, 
                  get_important_data_for_url: function(){
  
                      let data_copy = Object.assign({}, this._data);
                      for(var key in this.data_to_b64_ignore_props){
                          var prop = this.data_to_b64_ignore_props[key];
                          delete data_copy[prop];
                      }
  
                      return data_copy;
  
                  },
                  write_b64_to_history: function(){
                      //for the history we can use full data object , not really working :(
                      var data = this.get_important_data_for_url();
                      var b64_string = this.data_to_b64(data);
                      this.data_history.push(b64_string);
                      this.data_history_index = parseInt(this.data_history.length -1);
                      
                      console.log("write_b64_to_history, history: ");
                      console.log(this.data_history);
                  },
                  write_b64_to_url: function(){
                      var data = this.get_important_data_for_url();
                      var b64_string = this.data_to_b64(data);
                      var parts = window.location.href.split(this.url_b64_separator);
                      var clear_url = parts.shift();
                      // !IMPORTANT , while developing and using write_b64_to_url, data will be loaded between site reloads which leads to unexpected behaviuours !!!, don't ever use write_b64_to_url in development
                      if(!this.development){
                          window.location.href = clear_url + this.url_b64_separator + this.url_b64_prop + this.url_b64_assignment_character + b64_string;
                      }
                  },
                  read_b64_from_url: function(){
                      var parts = window.location.href.split(this.url_b64_separator);
                      var fragment = parts.pop();
                      var parts = fragment.split(this.url_b64_prop + this.url_b64_assignment_character);
                      //console.log(parts);
  
                      if(parts.length == 1){
                          return false;
                      }
                      var b64_string = parts.pop();
                      var data = this.b64_to_data(b64_string);
  
                      this.apply_data_copy_to_data(data);
                  },
                  data_to_b64: function(data){
  
                      var data_copy_json = JSON.stringify(data);
                      
                      var data_copy_json_b64 = btoa((encodeURIComponent(data_copy_json)));
  
                      return data_copy_json_b64;
  
                  },
                  b64_to_data : function(b64){
                      var atobed = atob(b64);
                      var data_json = decodeURIComponent(atobed);
                      var data = JSON.parse(data_json);
                      return data; 
                  },
                  apply_data_copy_to_data: function(data){
                      for(var key in data){
                          this[key] = data[key];
                      }
                      return true;
                  }, 
                  
                  "test_method": function(){
                      console.log("test");
                  }, 
              },
              computed: {
                  "test_computed": function(){
                      return "test_computed"
                  }
              }
          })
      
  });
  
  }

  // renderer process
var ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('store-data', function (event,store) {
    console.log(store);
    console.log("store");
    console.log("store");
    console.log("store");
    vue_stuff();
});

  