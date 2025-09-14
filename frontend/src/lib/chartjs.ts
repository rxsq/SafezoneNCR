"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler, 
} from "chart.js";

ChartJS.register(
  CategoryScale, // x axis for categorical labels
  LinearScale,   // y axis "linear" scale
  PointElement,
  LineElement,
  BarElement,
  ArcElement,    // doughnut/pie
  Tooltip,
  Legend,
  Title,
  Filler
);

export default ChartJS;
