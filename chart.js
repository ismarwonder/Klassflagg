// chart.js

import { dom } from './dom.js';
import { appState } from './state.js';
import { countFlags } from './utils.js';

const setupChartListener = (sessionCode) => {
  const usersRef = ref(database, `sessions/${sessionCode}/users`);
  onValue(usersRef, (snapshot) => {
    const users = snapshot.val() || {};
    const { greenCount, redCount } = countFlags(users);
    updateChart(greenCount, redCount);
  });
};  

const updateChart = (greenCount, redCount) => {
  const data = {
    labels: ['Grön Flagg', 'Röd Flagg'],
    datasets: [{
      data: [greenCount, redCount],
      backgroundColor: ['#28a745', '#dc3545'],
    }],
  };

  if (appState.flagChart) {
    appState.flagChart.data = data;
    appState.flagChart.update();
  } else {
    appState.flagChart = new Chart(dom.flagChartCtx, {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    });
  }
};



export { setupChartListener, updateChart };