let isStreaming = false; // Variable to keep track of streaming state
let fPressed = false; // Variable to keep track of F press
let jPressed = false; // Variable to keep track of J press

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// The variables fPressed and jPressed keep the continuous key down events from holding down a key adding unexpected events.
function handleKeyDown(event) {
  console.log("Key down:", event.key);
  if (event.key === "f" && !fPressed) {
    myChart.data.datasets[0].data.push({ x: Date.now(), y: 1 }); // "Left Hand" to 1
    fPressed = true;
  } else if (event.key === "j" && !jPressed) {
    myChart.data.datasets[1].data.push({ x: Date.now(), y: 1 }); // "Right Hand" to 1
    jPressed = true;
  }
  myChart.update();
}

function handleKeyUp(event) {
  console.log("Key up:", event.key);
  if (event.key === "f") {
    myChart.data.datasets[0].data.push({ x: Date.now(), y: 0 }); // "Left Hand" back to 0
    fPressed = false;
  } else if (event.key === "j") {
    myChart.data.datasets[1].data.push({ x: Date.now(), y: 0 }); // "Right Hand" back to 0
    jPressed = false;
  }
  myChart.update();
}


function toggleStreaming() {
  isStreaming = !isStreaming;
  myChart.options.scales.x.realtime.pause = !isStreaming;
  const resetButton = document.getElementById("resetButton");
  const exportButton = document.getElementById("exportButton");
  const instructions = document.getElementById("instructions"); // Get the instructions div

  if (isStreaming) {
    myChart.resetZoom();
    document.getElementById("stats").style.display = "none"; // Hide the stats div
    resetButton.style.display = "none"; // Hide the reset button
    exportButton.style.display = "none"; // Hide the export button
    instructions.style.display = "none"; // Hide the instructions
  } else {
    calculateAndDisplayStats();
    document.getElementById("stats").style.display = "flex"; // Show the stats div
    resetButton.style.display = "inline-block"; // Show the reset button
    exportButton.style.display = "inline-block"; // Show the export button
    //instructions.style.display = "block"; // Show the instructions
  }
  myChart.update();
  const button = document.getElementById("toggleButton");
  button.textContent = isStreaming ? "Stop Recording" : "Start Recording";
}

function resetData() {
  // Set the data arrays of both datasets to empty arrays
  myChart.data.datasets[0].data = [];
  myChart.data.datasets[1].data = [];

  // Update the chart to reflect the change
  myChart.update();
}

// setup block
const data = {
  datasets: [
    {
      label: "Left Hand (F)",
      data: [],
      backgroundColor: "rgb(142, 197, 206, 0.8)",
      borderColor: "rgb(106, 148, 155, 0.8)",
      borderWidth: 1,
      fill: "origin",
      stepped: "true",
    },
    {
      label: "Right Hand (J)",
      data: [],
      backgroundColor: "rgb(255, 169, 8, 0.8)",
      borderColor: "rgb(204, 135, 6, 0.8)",
      borderWidth: 1,
      fill: "origin",
      stepped: "true",
    },
  ],
};

// config black
const config = {
  type: "line",
  data,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      streaming: {
        ttl: 3600000,
      },
      zoom: {
        pan: {
          enabled: true,
          mode: "x",
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: false,
          },
        },
      },
    },
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        type: "realtime",
        realtime: {
          pause: true,
          onRefresh: (chart) => {
            chart.data.datasets.forEach((dataset) => {});
          },
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
};

function calculateAndDisplayStats() {
  const leftHandData = myChart.data.datasets[0].data;
  const rightHandData = myChart.data.datasets[1].data;

  // Function to calculate statistics
  function calculateStats(data) {
    let moves = 0;
    let totalHoldTime = 0;
    let longestHoldTime = 0;
    for (let i = 1; i < data.length; i += 2) {
      // Assumes data starts with a press event
      const holdTime = data[i].x - data[i - 1].x;
      totalHoldTime += holdTime;
      longestHoldTime = Math.max(longestHoldTime, holdTime);
      moves++;
    }
    return { moves, totalHoldTime, longestHoldTime };
  }

  const leftStats = calculateStats(leftHandData);
  const rightStats = calculateStats(rightHandData);

  const totalMoves = leftStats.moves + rightStats.moves;
  const averageHoldTime =
    (leftStats.totalHoldTime + rightStats.totalHoldTime) / (totalMoves * 1000);
  const longestHoldTime =
    Math.max(leftStats.longestHoldTime, rightStats.longestHoldTime) / 1000;
  const totalHoldTime =
    (leftStats.totalHoldTime + rightStats.totalHoldTime) / 1000; // Convert to seconds
  const leftHoldtime = 
    (leftStats.totalHoldTime / 1000);
  const rightHoldtime = 
    (rightStats.totalHoldTime / 1000);

  // Display the statistics
  const statsText = `🧗‍♀️ Movement Breakdown:
      👈 Left Moves: ${leftStats.moves}
      👉 Right Moves: ${rightStats.moves}
    ⏱️ Timing Stats:
      ⌚ Avg. Hold Time: ${averageHoldTime.toFixed(1)} sec
      ⛽ Longest Hold Time: ${longestHoldTime.toFixed(1)} sec
      🙌 Time Under Tension: ${Math.floor(totalHoldTime / 60)} min, ${(
    totalHoldTime % 60
  ).toFixed(1)} sec
      🤜 Left Hand: ${leftHoldtime.toFixed(1)} sec
      🤛 Right Hand: ${rightHoldtime.toFixed(1)} sec
    📊 Stats Courtesy: 🤙BetaHangtime`;
  document.getElementById("statsText").value = statsText;
}

function copyStats() {
  const textarea = document.getElementById("statsText");
  textarea.select();
  document.execCommand("copy");
}

function exportData() {
  // Get the datasets from the chart
  const leftHandData = myChart.data.datasets[0].data;
  const rightHandData = myChart.data.datasets[1].data;

  function formatTime(date) {
    // Format the date object to a time string (HH:mm:ss) using the user's local time zone
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    // Get the milliseconds component of the date object, padded with zeros to three digits
    const ms = date.getMilliseconds().toString().padStart(3, "0");

    // Concatenate the time string and milliseconds string with a period in between
    return `${timeString}.${ms}`;
  }

  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,Time,Left Hand,Right Hand\n";

  let i = 0,
    j = 0;
  let leftValue = 0,
    rightValue = 0; // Initialize the values outside the loop
  while (i < leftHandData.length || j < rightHandData.length) {
    const leftEvent = leftHandData[i] || { x: Infinity };
    const rightEvent = rightHandData[j] || { x: Infinity };

    let currentTimestamp;
    if (leftEvent.x <= rightEvent.x) {
      currentTimestamp = new Date(leftEvent.x);
      leftValue = leftEvent.y; // Update the value only when a new event is processed
      i++;
    } else {
      currentTimestamp = new Date(rightEvent.x);
      rightValue = rightEvent.y; // Update the value only when a new event is processed
      j++;
    }

    const formattedTime = formatTime(currentTimestamp);
    csvContent += `${formattedTime},${leftValue},${rightValue}\n`;
  }

  // Encode CSV content
  const encodedUri = encodeURI(csvContent);

  // Create download link and click it to initiate download
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "BetaHangtime_rawdata.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// render init block
const myChart = new Chart(document.getElementById("myChart"), config);
