/**
 * echarts主题包封装
 */

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define(["exports", "echarts"], factory);
  } else if (
    typeof exports === "object" &&
    typeof exports.nodeName !== "string"
  ) {
    // CommonJS
    factory(exports, require("echarts"));
  } else {
    // Browser globals
    factory({}, root.echarts);
  }
})(this, function (exports, echarts) {
  var log = function (msg) {
    if (typeof console !== "undefined") {
      console && console.error && console.error(msg);
    }
  };
  if (!echarts) {
    log("ECharts is not Loaded");
    return;
  }
  echarts.registerTheme("customized", {
    color: [
      "#5070dd",
      "#b6d634",
      "#505372",
      "#ff994d",
      "#0ca8df",
      "#ffd10a",
      "#fb628b",
      "#785db0",
      "#3fbe95",
    ],
    backgroundColor: "rgba(0, 0, 0, 0)",
    textStyle: {},
    title: {
      textStyle: {
        color: "#464646",
      },
      subtextStyle: {
        color: "#6E7079",
      },
    },
    line: {
      itemStyle: {
        borderWidth: 1,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 4,
      symbol: "emptyCircle",
      smooth: false,
    },
    radar: {
      itemStyle: {
        borderWidth: 1,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 4,
      symbol: "emptyCircle",
      smooth: false,
    },
    bar: {
      itemStyle: {
        barBorderWidth: 0,
        barBorderColor: "#ccc",
      },
    },
    pie: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    scatter: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    boxplot: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    parallel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    sankey: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    funnel: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    gauge: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
    },
    candlestick: {
      itemStyle: {
        color: "#eb5454",
        color0: "#47b262",
        borderColor: "#eb5454",
        borderColor0: "#47b262",
        borderWidth: 1,
      },
    },
    graph: {
      itemStyle: {
        borderWidth: 0,
        borderColor: "#ccc",
      },
      lineStyle: {
        width: 1,
        color: "#aaa",
      },
      symbolSize: 4,
      symbol: "emptyCircle",
      smooth: false,
      color: [
        "#5070dd",
        "#b6d634",
        "#505372",
        "#ff994d",
        "#0ca8df",
        "#ffd10a",
        "#fb628b",
        "#785db0",
        "#3fbe95",
      ],
      label: {
        color: "#eee",
      },
    },
    map: {
      itemStyle: {
        areaColor: "#eee",
        borderColor: "#444",
        borderWidth: 0.5,
      },
      label: {
        color: "#000",
      },
      emphasis: {
        itemStyle: {
          areaColor: "rgba(255,215,0,0.8)",
          borderColor: "#444",
          borderWidth: 1,
        },
        label: {
          color: "rgb(100,0,0)",
        },
      },
    },
    geo: {
      itemStyle: {
        areaColor: "#eee",
        borderColor: "#444",
        borderWidth: 0.5,
      },
      label: {
        color: "#000",
      },
      emphasis: {
        itemStyle: {
          areaColor: "rgba(255,215,0,0.8)",
          borderColor: "#444",
          borderWidth: 1,
        },
        label: {
          color: "rgb(100,0,0)",
        },
      },
    },
    categoryAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisLabel: {
        show: true,
        color: "#54555a",
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: ["#dbdee4"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["rgba(234,237,245,0.5)", "rgba(255,255,255,0)"],
        },
      },
    },
    valueAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisLabel: {
        show: true,
        color: "#54555a",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ["#dbdee4"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["rgba(234,237,245,0.5)", "rgba(255,255,255,0)"],
        },
      },
    },
    logAxis: {
      axisLine: {
        show: false,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisTick: {
        show: false,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisLabel: {
        show: true,
        color: "#54555a",
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ["#dbdee4"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["rgba(234,237,245,0.5)", "rgba(255,255,255,0)"],
        },
      },
    },
    timeAxis: {
      axisLine: {
        show: true,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: "#54555a",
        },
      },
      axisLabel: {
        show: true,
        color: "#54555a",
      },
      splitLine: {
        show: false,
        lineStyle: {
          color: ["#dbdee4"],
        },
      },
      splitArea: {
        show: false,
        areaStyle: {
          color: ["rgba(234,237,245,0.5)", "rgba(255,255,255,0)"],
        },
      },
    },
    toolbox: {
      iconStyle: {
        borderColor: "#999",
      },
      emphasis: {
        iconStyle: {
          borderColor: "#666",
        },
      },
    },
    legend: {
      textStyle: {
        color: "#333",
      },
      left: "center",
      right: "auto",
      top: "auto",
      bottom: 15,
    },
    tooltip: {
      axisPointer: {
        lineStyle: {
          color: "#ccc",
          width: 1,
        },
        crossStyle: {
          color: "#ccc",
          width: 1,
        },
      },
    },
    timeline: {
      lineStyle: {
        color: "#DAE1F5",
        width: 2,
      },
      itemStyle: {
        color: "#A4B1D7",
        borderWidth: 1,
      },
      controlStyle: {
        color: "#A4B1D7",
        borderColor: "#A4B1D7",
        borderWidth: 1,
      },
      checkpointStyle: {
        color: "#316bf3",
        borderColor: "#fff",
      },
      label: {
        color: "#A4B1D7",
      },
      emphasis: {
        itemStyle: {
          color: "#FFF",
        },
        controlStyle: {
          color: "#A4B1D7",
          borderColor: "#A4B1D7",
          borderWidth: 1,
        },
        label: {
          color: "#A4B1D7",
        },
      },
    },
    visualMap: {
      color: ["#bf444c", "#d88273", "#f6efa6"],
    },
    markPoint: {
      label: {
        color: "#eee",
      },
      emphasis: {
        label: {
          color: "#eee",
        },
      },
    },
    grid: {
      left: "15%",
      right: "10%",
      top: 65,
      bottom: 80,
    },
  });
});
