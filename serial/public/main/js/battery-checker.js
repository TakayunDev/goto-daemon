/* バッテリーチェック
 * callback: function(battery_quantity)
 * battery: Array = {battery0, battery1}
 */
function get_battery_quantity(callback) {
  var that = get_battery_quantity;
  var battery = [];
  //$.when(
    $.get("/arduino/read/battery0", function(quantity) {
      battery[0] = Number(quantity);
    }),
    $.get("/arduino/read/battery1", function(quantity) {
      battery[1] = Number(quantity);
    })
  //)
  //.then(function(){callback(battery)})
  //.fail(function(){console.log("error:"+that.name)});
}
function CheckBattery() {
  this.isEmpty = [0, 0];
  this.alert = new Audio("media/battery_empty.mp3");
}
CheckBattery.prototype.update_empty = function() {
  var that = this;
  get_battery_quantity(
    function(battery) {
      that.isEmpty[0] = (battery[0] > 0.1 && battery[0] < 7.25)? that.isEmpty[0]+1:0;
      that.isEmpty[1] = (battery[1] > 0.1 && battery[1] < 7.25)? that.isEmpty[1]+1:0;
    }
)};
CheckBattery.prototype.start = function() {
  this.interval = setInterval(this.pool.bind(this), 2500);
}
CheckBattery.prototype.pool = function() {
  this.update_empty();
  if (this.isEmpty[0] > 2 || this.isEmpty[1] > 2) {
    if (this.alert.played.length == 0) {
      this.alert.play();
    } else if (this.alert.played.length == 1) {
      this.alert.play();
    }
  }
}
CheckBattery.prototype.setEmpty = function(index, empty) {
  this.isEmpty[index] = empty;
}
CheckBattery.prototype.stop = function(){
  clearInterval(this.interval);
}
var check_battery = new CheckBattery();
//window.addEventListener('load', function(){check_battery.start();});