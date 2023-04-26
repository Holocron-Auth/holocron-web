import React, { FC } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

import { Doughnut as DoughnutChart } from "react-chartjs-2";

interface DoughProps {
  pct: number;
  title: string;
}

const Doughnut: FC<DoughProps> = ({ pct, title }) => {
  const data = {
    backgroundColor: ["#FFB267", "#000000"],
    labels: ["Total", "Completed"],
    datasets: [
      {
        label: { title },
        data: [pct, 100 - pct],
        backgroundColor: ["#FFB267", "#000000"],
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      arc: {
        weight: 1.5,
        borderWeight: 0,
      },
    },
    cutout: "69%",
  };

  // @ts-ignore
  return <DoughnutChart options={options} data={data} width={50} height={50} />;
};

export default Doughnut;
