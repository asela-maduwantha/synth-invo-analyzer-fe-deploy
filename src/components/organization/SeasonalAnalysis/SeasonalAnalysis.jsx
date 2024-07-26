import React, { useState, useEffect, useRef, useCallback } from 'react';
import HTTPService from '../../../Service/HTTPService';
import { Card } from 'antd';
import Chart from 'chart.js/auto';

const { Meta } = Card;

const SeasonalAnalysis = () => {
  const [monthlySalesData, setMonthlySalesData] = useState({});
  const [seasonalSalesData, setSeasonalSalesData] = useState({});
  const monthlyChartRef = useRef(null);
  const seasonalChartRef = useRef(null);

  const fetchMonthlySales = useCallback(async () => {
    try {
      const response = await HTTPService.get('analysis/get_monthly_sales/');
      setMonthlySalesData(response.data);
    } catch (error) {
      console.error('Error fetching monthly sales data:', error);
    }
  }, []);

  const fetchSeasonalSales = useCallback(async () => {
    try {
      const response = await HTTPService.get('analysis/get_seasonal_sales/', {
        headers: {
          'Cookie': 'csrftoken=eVzK5Xpc3Jak1adzWfVt96iZROVDZ70z',
        },
      });
      setSeasonalSalesData(response.data);
    } catch (error) {
      console.error('Error fetching seasonal sales data:', error);
    }
  }, []);

  const prepareMonthlyChartData = useCallback(() => {
    const labels = [];
    const values = [];

    Object.keys(monthlySalesData).forEach((dateStr) => {
      const date = new Date(dateStr);
      const monthName = date.toLocaleString('default', { month: 'short' });
      labels.push(monthName);
      values.push(monthlySalesData[dateStr]);
    });

    return { labels, values };
  }, [monthlySalesData]);

  const prepareSeasonalChartData = useCallback(() => {
    const labels = ['Mar', 'May', 'Jun'];
    const values = [
      seasonalSalesData['3'] || 0,
      seasonalSalesData['5'] || 0,
      seasonalSalesData['6'] || 0,
    ];
    const colors = 'rgb(75, 192, 192)';

    return { labels, values, colors };
  }, [seasonalSalesData]);

  const drawMonthlySalesChart = useCallback(() => {
    const chartData = prepareMonthlyChartData();

    const ctx = document.getElementById('monthlySalesChart');
    if (ctx) {
      monthlyChartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Monthly Sales',
              data: chartData.values,
              fill: false,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => `Sales: $${tooltipItem.raw.toFixed(2)}`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Month',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Sales ($)',
              },
            },
          },
        },
      });
    }
  }, [prepareMonthlyChartData]);

  const drawSeasonalSalesChart = useCallback(() => {
    const chartData = prepareSeasonalChartData();

    const ctx = document.getElementById('seasonalSalesChart');
    if (ctx) {
      seasonalChartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: 'Seasonal Sales',
              data: chartData.values,
              fill: false,
              borderColor: chartData.colors,
              tension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) =>
                  `Sales: $${tooltipItem.raw.toFixed(2)}`,
              },
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Month',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Sales ($)',
              },
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [prepareSeasonalChartData]);

  useEffect(() => {
    fetchMonthlySales();
    fetchSeasonalSales();
  }, [fetchMonthlySales, fetchSeasonalSales]);

  useEffect(() => {
    if (monthlyChartRef.current) {
      monthlyChartRef.current.destroy();
    }
    if (seasonalChartRef.current) {
      seasonalChartRef.current.destroy();
    }
    drawMonthlySalesChart();
    drawSeasonalSalesChart();
  }, [
    monthlySalesData,
    seasonalSalesData,
    drawMonthlySalesChart,
    drawSeasonalSalesChart,
  ]);

  return (
    <div>
      <Card
        style={{ width: 800, height: 500, marginBottom: '20px' }}
      >
        <Meta title="Seasonal Analysis" />
        <div>
          <canvas id="seasonalSalesChart"></canvas>
        </div>
      </Card>

      <Card style={{ width: 800, height: 500 }}>
        <Meta title="Monthly Sales Trends Chart" />
        <div>
          <canvas id="monthlySalesChart"></canvas>
        </div>
      </Card>
    </div>
  );
};

export default SeasonalAnalysis;
