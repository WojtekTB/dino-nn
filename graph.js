//source https://gionkunz.github.io/chartist-js/index.html

function drawChart(values) {
  var data = {
    labels: ["fitness"],
    series: [values]
  };
  var options = {
    showPoint: false,
    lineSmooth: false,
    axisX: {
      showGrid: false,
      showLabel: false
    },
    axisY: {
      offset: 60,
      labelInterpolationFnc: function(value) {
        return value;
      }
    }
  };
  myChart = new Chartist.Line(".ct-chart", data, options);
}
